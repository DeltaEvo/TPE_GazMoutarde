class MDL {
    constructor(md, options) {
        md.renderer.rules.table_open =  (tokens, idx, options, env, renderer) => this.render(tokens, idx, options,env, renderer);
    }

    render(tokens,idx,options,env, renderer) {
      const t = tokens[idx];
      console.log(t);
      if(!t.attrs) t.attrs = [];
      t.attrs.push(["class", "mdl-data-table mdl-js-data-table"]);
      return renderer.renderToken(tokens, idx, options);
    }
}

module.exports = function apply(md , options) {
    return new MDL(md , options);
};
