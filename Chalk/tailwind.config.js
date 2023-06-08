/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/*.{pug, html}',
            './node_modules/flowbite/**/*.js'
          ],
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
      }
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

