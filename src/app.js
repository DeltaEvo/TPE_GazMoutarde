import 'impress.js'
import './vendor/impressConsole'

impress().init();
impressConsole().init();

const molecules = document.querySelectorAll('[mol]');
for (let mol of molecules){
  console.log('mol', mol);
}
console.log(molecules);
