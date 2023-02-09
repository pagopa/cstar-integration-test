import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'


const filepath = 'sample-output.txt';


export default function () {
    for(let i=0; i<=50000; i++){
        
        console.log(randomFiscalCode()+'\n')
       

    }  
   /* file.writeString(filepath, fiscalCodeRandom+'\n');
    file.appendString(filepath, `Second line. VU: ${__VU}  -  ITER: ${__ITER}`);*/

}