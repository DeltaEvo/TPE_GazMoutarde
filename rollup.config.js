import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

import uglify from 'rollup-plugin-uglify';

export default {
    entry: 'src/app.js',
    dest: 'dist/app.js',
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        nodeResolve({
            jsnext: true,
            browser: true
        }),
        uglify()
    ],
    format: 'iife'
}
