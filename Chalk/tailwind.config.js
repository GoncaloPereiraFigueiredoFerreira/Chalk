/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/*.{pug, html}',
            './node_modules/flowbite/**/*.js'
          ],
  theme: {
    extend: {
    },
    fontFamily:{
      'pacifico': ['Pacifico','sans-serif']
    }
  },
  variants:{
    extend:{}
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

