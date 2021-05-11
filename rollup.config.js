import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'pm.js',
  output: {
    file: 'static/js/pm.bundle.js',
    format: 'iife',
    name: 'pm'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
