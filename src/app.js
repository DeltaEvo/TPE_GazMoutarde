import 'impress.js'

impress().init();

const molecules = document.querySelectorAll('[mol]');
for (let mol of molecules){
  console.log('mol', mol);
}
console.log(molecules);
