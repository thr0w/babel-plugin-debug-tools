
import * as path from 'path';
import * as babel from "@babel/core";
import { toMatchFile } from 'jest-file-snapshot';

expect.extend({ toMatchFile });

const configs = {
  production: {
    plugins: [
      [
        require.resolve('../index'),
        {
          mode: 'production',
          identifier: 'H5'
        }
      ]
    ],
  },
  development: {
    plugins: [
      [
        require.resolve('../index'),
        {
          mode: 'development',
          identifier: 'H5'
        }
      ]
    ],
  }
};

describe('babel-debug-tools', () => {

  describe('LOG', () => {
    it('production', () => {
      const { code, output } = transform('LOG', 'production')
      expect(code).toMatchFile(output)
    })
    it('development', () => {
      const { code, output } = transform('LOG', 'development')
      expect(code).toMatchFile(output)
    })
  })

  describe('ASSERT', () => {
    it('production', () => {
      const { code, output } = transform('ASSERT', 'production')
      expect(code).toMatchFile(output)
    })
    it('development', () => {
      const { code, output } = transform('ASSERT', 'development')
      expect(code).toMatchFile(output)
    })
  })

  describe('TRACE', () => {
    it('production', () => {
      const { code, output } = transform('TRACE', 'production')
      expect(code).toMatchFile(output)
    })
    it('development', () => {
      const { code, output } = transform('TRACE', 'development')
      expect(code).toMatchFile(output)
    })
  })

});

function transform(test: 'LOG' | 'ASSERT' | 'TRACE', config: 'production' | 'development') {
  const gen = babel.transformFileSync(path.join(__dirname, '..', '__fixtures__', test, 'code.js'), configs[config]);
  const output = path.join(__dirname, '..', '__fixtures__', test, config + '.output.js')
  return { code: gen?.code || '', output }
}