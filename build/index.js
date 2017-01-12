const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs-promise");

const markdown = new (require("markdown-it"))('commonmark');
markdown.use(require("./MarkdownItVariables") );

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR , process.env.OUTPUT_DIR);
const SLIDES_DIR = path.join(ROOT_DIR , 'slides');

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

function readSlides() {
    return fs.walk(SLIDES_DIR)
        .then(files => {
            return Promise.all(
                files.filter(file => file.stats.isFile()).map(file =>
                    fs.readFile(file.path, {encoding:'utf8'})
                        .then(content => {
                            const env = {};
                            const data = markdown.render(content , env);
                            return { data, vars: env }
                        })
                )
            );
        });
}

function compileTemplate(slides) {
    return new Promise((resolve, reject) => {
        return nunjucks.render("index.nunjucks" , { slides } , (err , res) => {
            if(err)
                reject(err);
            else
                resolve(res);
        });
    });
}

console.log(`Output dir: ${OUTPUT_DIR}`);
readSlides()
    .then(compileTemplate)
    .then(template => fs.writeFile(path.join(OUTPUT_DIR , 'index.html') , template));
