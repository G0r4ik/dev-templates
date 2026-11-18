import doiuse from 'doiuse'
// import purgecss from '@fullhuman/postcss-purgecss'
import flexbugsFixes from 'postcss-flexbugs-fixes'
import presetEnv from 'postcss-preset-env'
import reporter from 'postcss-reporter'

const postcss = ({ env }) => ({
  plugins:
    env === 'production'
      ? [
          doiuse({
            ignoreFiles: ['**/normalize.css', '**/node_modules/**/*.css'],
            ignore: ['css-gradients', 'css-sticky'],
          }),
          // purgecss({
          //   content: [
          //     './src/**/*.*',
          //     './node_modules/flatpickr/dist/flatpickr.css',
          //   ],
          // }),
          flexbugsFixes,
          presetEnv,
          reporter({ clearReportedMessages: true }),
        ]
      : [],
})

export default postcss
