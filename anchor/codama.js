import { createCodamaConfig } from 'gill'

export default createCodamaConfig({
  clientJs: 'anchor/src/client/js/generated',
  idl: 'target/idl/blogs_web3.json',
})
