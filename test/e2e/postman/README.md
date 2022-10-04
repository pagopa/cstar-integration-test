# Test book
This readme contains a resume about postman collection tests, like how to use, or particular preconditions to satisfy before launch the tests.

** !!! Every pre-conditions statements should be automatized asap **

## Ade Ack Download Collections
Actually contains tests regarding ade acks download authorizations. To deal with this automatic test a manual pre-conditions must be satisfied:
- upload the file `ADEACK.TEST1.434743.2022-09-29.36e8ae41-42b3-038a-8b8e-4da0a2f854a8.csv` inside `sender-ade-ack` container inside `TEST1` folder.
- turn VPN cause use ingress IP in order to use unexposed api
- enviroment variables:
  `base_url` => url to apim
  `ingress_base_url` => url to k8s ingress 
  `test_api_key` => api key enabled on right env