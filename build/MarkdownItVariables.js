const VAR_SET_REGEX = /@(\S+)\s*=\s*(\S.*)/;
const VAR_GET_REGEX = /@(\S+)/;

class MarkdownItVariables {
    constructor(md, options) {
        md.core.ruler.push("variables", (state, silent) => this.scan(state, silent));
    }

    scan(state) {
        state.tokens
            .filter(tok => tok.type == 'inline')
            .filter(tok => tok.content.includes('@'))
            .forEach((e) => {
                e.children.forEach((child , i , arr) => {
                    const matchSet = child.content.match(VAR_SET_REGEX);
                    let matchGet = child.content.match(VAR_GET_REGEX);
                    if(matchSet){
                        const [, name, value] = matchSet;
                        state.env[name] = value;
                        arr.splice(i, 2);
                    } else if(matchGet)
                        do {
                            const [, name] = matchGet;
                            if(!state.env[name])
                                throw new Error("Undefined variable name ${name}");
                            child.content = child.content.replace(`@${name}`, state.env[name]);
                            matchGet = child.content.match(VAR_GET_REGEX);
                        } while (matchGet);
                });
                if(e.children.length == 0)
                    state.tokens.splice(state.tokens.indexOf(e) - 1, 3);
            });
    }
}

module.exports = function apply(md , options) {
    return new MarkdownItVariables(md , options);
};