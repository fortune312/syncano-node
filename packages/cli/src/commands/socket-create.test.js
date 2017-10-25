import sinon from 'sinon';
import inquirer from 'inquirer';
import format from 'chalk';
import SocketCreate from './socket-create';
import context from '../utils/context';
import printTools from '../utils/print-tools';
import { getRandomString } from '../utils/test-utils';

describe('[commands] Create Socket', function() {
  const socketCreate = new SocketCreate(context);
  let echo = null;
  let interEcho = null;
  let error = null;
  let prompt = null;
  let create = null;

  beforeEach(function() {
    interEcho = sinon.stub();
    create = sinon.stub(socketCreate.Socket, 'create');
    prompt = sinon.stub(inquirer, 'prompt');
    echo = sinon.stub(printTools, 'echo', (content) => interEcho);
    error = sinon.stub(printTools, 'error');
  });

  afterEach(function() {
    interEcho.reset();
    socketCreate.Socket.create.restore();
    inquirer.prompt.restore();
    printTools.echo.restore();
    printTools.error.restore();
  });

  describe('with parameter specified', function() {
    const templateName = getRandomString('createSocket_templateName');
    const socketName = getRandomString('createSocket_socketName');
    const returnedSocketPath = 'Get Socket Path';

    beforeEach(function() {
      prompt.returns({ template: templateName });
    });

    it('should call prompt with proper question', async function() {
      const expectedQuestions = [{
        name: 'template',
        type: 'list',
        message: '  Choose template for your Socket',
        choices: ['    empty - Empty Socket', '    example - Example Socket with one mocked endpoint (recommended)'],
        default: 1
      }];

      create.returns(Promise.resolve({ getSocketPath: () => returnedSocketPath }));

      await socketCreate.run([socketName]);

      sinon.assert.calledWith(prompt, expectedQuestions);
    });

    it('should call Socket.create with proper parameters', async function() {
      create.returns(Promise.resolve({ getSocketPath: () => returnedSocketPath }));

      await socketCreate.run([socketName]);

      sinon.assert.calledWith(create, socketName, templateName);
    });

    it('should call echo metod with proper parameters when Socket.create is resolved', async function() {
      const expectedPrint = `Your Socket configuration is stored at ${format.cyan(returnedSocketPath)}`;

      create.returns(Promise.resolve({ getSocketPath: () => returnedSocketPath }));

      await socketCreate.run([socketName]);

      sinon.assert.calledWith(echo, 4);
      sinon.assert.calledWith(interEcho, expectedPrint);
    });

    it('should call error metod with proper parameters when Socket.create is rejected', async function() {
      create.returns(Promise.reject('error'));

      await socketCreate.run([socketName]);

      sinon.assert.calledWith(error, 'error');
    });
  });
});
