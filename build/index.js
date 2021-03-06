const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs-promise");

const markdown = new (require("markdown-it"))();
markdown.use(require("./MarkdownItVariables") );
markdown.use(require("./MDL"));
const mcontainer = require("markdown-it-container");
markdown.use(mcontainer, 'left-align' );
markdown.use(mcontainer, 'center' );
markdown.use(mcontainer, 'white' );
markdown.use(mcontainer, 'right' );
const ROOT_DIR = path.join(__dirname, '..');
const STATIC_DIR = path.join(ROOT_DIR, 'static');
const OUTPUT_DIR = path.join(ROOT_DIR , process.env.OUTPUT_DIR);
const SLIDES_DIR = path.join(ROOT_DIR , 'slides');

const RELATIVE_POSITIONS = {
    left: {
        ref: "x",
        multiplier: -1
    },
    right: {
        ref: "x",
        multiplier: 1
    },
    up: {
        ref: "y",
        multiplier: -1
    },
    down: {
        ref: "y",
        multiplier: 1
    }
};

nunjucks.configure(path.join(ROOT_DIR , 'templates'), {
    autoescape: true,
    trimBlocks: true,
    lstripBlocks: true,
    throwOnUndefined: true
});


fs.ensureDir(OUTPUT_DIR)
    .catch(e => {
        console.error(`Cannot create output directory: ${e}`);
        process.exit(-1);
    });

fs.copy(STATIC_DIR, path.join(OUTPUT_DIR, 'static'))
  .catch(e => {
    console.error(`Cannot copy static dir ${e} `);
    process.exit(-1);
  })

function readSlides() {
    return fs.walk(SLIDES_DIR)
        .then(files => {
            return Promise.all(
                files.filter(file => file.stats.isFile()).map(file =>
                    fs.readFile(file.path, { encoding:'utf8' })
                        .then(content => {
                            const env = {};
                            const data = markdown.render(content , env);
                            const p = path.relative(SLIDES_DIR , file.path);

                            return { data, vars: env, name: p.substring(0 , p.length - path.extname(p).length).trim() }
                        })
                )
            );
        }).then((slides) => slides.sort((a , b) => a.name.localeCompare(b.name)));
}

function relSlide(slides, slide , attr) {
    const relative = RELATIVE_POSITIONS[attr];
    if(!relative)
        throw new Error(`undefined attr ${attr}`);

    if(slide.vars[`computed${relative.ref}`]) // If already computed
        return slide.vars[relative.ref];

    slide.vars[`computed${relative.ref}`] = true;

    if(!slide.vars[attr])
        return slide.vars[relative.ref];

    const target = findSlide(slides , slide.vars[attr]);

    return slide.vars[relative.ref] =
        ((target ? parseInt(relSlide(slides , target, attr) || 0) : 0)
            + parseInt(slide.vars[relative.ref] || 0) + (1200 * relative.multiplier));
}


function findSlide(slides , name) {
    return slides.filter((slide) => slide.name == name)[0];
}

function computeRelSlides(slides) {
    slides.forEach((slide) => {
        for(let pos in RELATIVE_POSITIONS)
            if(slide.vars[pos])
                relSlide(slides , slide , pos);
    });
    console.log(slides);
    return slides;
}

function compileTemplate(slides) {
    return new Promise((resolve, reject) => {
        return nunjucks.render("index.nunjucks" , { slides: slides } , (err , res) => {
            if(err)
                reject(err);
            else
                resolve(res);
        });
    });
}

console.log(`Output dir: ${OUTPUT_DIR}`);
readSlides()
    .then(computeRelSlides)
    .then(compileTemplate)
    .then(template => fs.writeFile(path.join(OUTPUT_DIR , 'index.html') , template));
