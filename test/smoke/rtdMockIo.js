import { group } from 'k6'
import { assert, statusOk } from '../common/assertions.js'
import { getUser, loginWithApiKey } from '../common/api/bpdIoLogin.js'
import { setupEnvironment } from "../common/setupenv.js";

const { env, services } = setupEnvironment('../../services/environments.json');

export default () => {
  group('Mock IO', () => {
    group('Should create a valid IO token', () => {
      const response = loginWithApiKey(services.io.baseUrl, env.MOCK_API_KEY, "FAKE_CF");
      assert(response, [
        statusOk()
      ]);

      group('Should authorize a valid token', () => {
        const token = response.body;
        assert(
          getUser(services.io.baseUrl, env.MOCK_API_KEY, token),
          [ statusOk() ]
        );
      });
    });
  });
}
