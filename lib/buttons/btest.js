import '/lib/jquery.js';
import Button from './buttons.js';
function init() {
    console.log("init");
    let main=$(".main");
    console.log(main);
    let button = new Button("Hello",()=>{console.debug("Hello");});
    let toggle = new Button(["no","absolutely!"],(x)=>{console.debug(x);},true);
    main.append(button.$w);
    main.append(toggle.$w);
};
$(init);
