(function(){function CharStyle(color,bgcolor,fontstyle)
{this.color=color;this.bgcolor=bgcolor;this.fontstyle=getOrDefault(fontstyle,"");}
CharStyle.prototype.getWrapper=function(html)
{return'<b style="color:'+ this.color+';background-color:'+
this.bgcolor+';font-style:'+ this.fontstyle+';font-family:\'Courier New\',Courier;">'+ html+"</b>";};var charStyles={"`":new CharStyle("#186F18","#248F24"),"τ":new CharStyle("#6BB224","#248F24"),"▲":new CharStyle("#105410","#248F24"),"∞":new CharStyle("#FFFFCC","#248F24"),'"':new CharStyle("#5CE62E","#248F24"),",":new CharStyle("#CCFF99","#248F24"),"♣":new CharStyle("#FFDD00","#248F24"),"*":new CharStyle("#CCCCFF","#248F24"),"+":new CharStyle("#FFAEDD","#248F24"),"×":new CharStyle("#FF613E","#248F24"),"?":new CharStyle("#FFFFFF","#69B"),"=":new CharStyle("#654930","#957554"),"≡":new CharStyle("#503710","#7A5229"),"•":new CharStyle("#808080","#FCFCFC"),"i":new CharStyle("#FFCF65","#EA8F25"),"Ω":new CharStyle("#707070","#E6E6E6"),"≈":new CharStyle("#217ECA","#002E8A"),".":new CharStyle("#685542","#866F58"),"~":new CharStyle("#B4A171","#D4C18A"),"░":new CharStyle("#444444","#666666"),"▒":new CharStyle("#5A1300","#7A2900"),"▓":new CharStyle("#171717","#3D3D3D"),"█":new CharStyle("#101010","#000000"),"☼":new CharStyle("#FFFFFF","#FFCC00"),"○":new CharStyle("#33AA33","#66FF66"),"œ":new CharStyle("#223322","#555555"),"⌂":new CharStyle("#EE66FF","#AA22FF"),"═":new CharStyle("#452309","#754719"),"¶":new CharStyle("#111111","#F7F7F7"),"¥":new CharStyle("#000000","")};var regexStyles={"([0-9]+)(?=.?<br>)":new CharStyle("#111","","italic"),};var initialKeyTimeout=500;var keyInterval=100;var gameModeTag="data-exgamemode";var commandModeTag="data-excommandmode";var sayModeTag="data-exsaymode";var modeColors={};modeColors[gameModeTag]="lightgray";modeColors[commandModeTag]="lightgreen";modeColors[sayModeTag]="lightcyan";window.addEventListener("load",onLoad);function now()
{if(window.performance)
return window.performance.now();return new Date().getTime();}
function getMessageBox()
{return document.querySelector('#sendpane textarea');}
function gameModeEnabled(element)
{element=getOrDefault(element,getMessageBox());return element&&element.hasAttribute(gameModeTag);}
function enableGameMode(element)
{console.log("Enabling game mode");element=getOrDefault(element,getMessageBox());if(element)
{element.value="";element.style.backgroundColor=modeColors[gameModeTag];element.setAttribute(gameModeTag,"");element.setAttribute("placeholder","exgame mode active. WASD-move "+"ARROWS-face E-use SPACE-pickup F-inventory C-craftmenu /-command ENTER-exit");addModuleMerge("ex");addMessageEvent(colorMeElmo);}}
function disableGameMode(element)
{element=getOrDefault(element,getMessageBox());console.log("Disabling game mode");if(element)
{element.style.backgroundColor="";element.removeAttribute(gameModeTag);element.removeAttribute("placeholder");removeModuleMerge("ex");removeMessageEvent(colorMeElmo);}}
function modeEnabled(tag,element)
{element=getOrDefault(element,getMessageBox());return element&&element.hasAttribute(tag);}
function enableMode(tag,element)
{element=getOrDefault(element,getMessageBox());console.log("Enabling "+ tag+" mode");if(element)
{element.style.backgroundColor=modeColors[tag];element.setAttribute(tag,"");}}
function disableMode(tag,element)
{element=getOrDefault(element,getMessageBox());console.log("Disabling "+ tag+" mode");if(element)
{element.style.backgroundColor=modeColors[gameModeTag];element.removeAttribute(tag);}}
function commandModeEnabled(element)
{return modeEnabled(commandModeTag,element);}
function enableCommandMode(element)
{enableMode(commandModeTag,element);}
function disableCommandMode(element)
{disableMode(commandModeTag,element);}
function sayModeEnabled(element)
{return modeEnabled(sayModeTag,element);}
function enableSayMode(element)
{enableMode(sayModeTag,element);}
function disableSayMode(element)
{disableMode(sayModeTag,element);}
function isForwardSlash(code)
{return code===191||code===111;}
function isLastBackspace(kdEvent)
{return(kdEvent.keyCode==8&&kdEvent.target.value.length<=1);}
function onLoad(e)
{var messageBox=getMessageBox();if(messageBox)
{messageBox.addEventListener("keydown",onMessageKey);}}
function colorMeElmo(dispMessage)
{if(dispMessage.getAttribute("data-module")!=="ex")
return;var key,regex,match;var map=dispMessage.firstElementChild;var plus=escapeRegExp('+');var minus=escapeRegExp('-');var tilde=escapeRegExp('~');var mapEdge=plus+'['+ minus+ tilde+']{15}'+ plus;var mapEdges=[];if(!map)
return;regex=new RegExp(mapEdge,'g');while((match=regex.exec(map.innerHTML)))
mapEdges.push(match.index);if(mapEdges.length!==2)
{return;}
var preMap=map.innerHTML.substring(0,mapEdges[0]+ 17);var realMap=map.innerHTML.substring(mapEdges[0]+ 17,mapEdges[1]);var postMap=map.innerHTML.substring(mapEdges[1],map.innerHTML.length);var tempIron=false;if((realMap.match(/█|▓|▒/g)||[]).length>200)
{tempIron=charStyles["▒"];charStyles["▒"]=new CharStyle("#303030","#474747");}
for(key in charStyles)
{if(!charStyles.hasOwnProperty(key))
continue;regex=new RegExp('('+ escapeRegExp(key)+')','g');realMap=realMap.replace(regex,'{$1}');}
for(key in regexStyles)
{if(!regexStyles.hasOwnProperty(key))
continue;regex=new RegExp(key,'g');realMap=realMap.replace(regex,'{$1}');}
for(key in charStyles)
{if(!charStyles.hasOwnProperty(key))
continue;regex=new RegExp('{'+ escapeRegExp(key)+'}','g');realMap=realMap.replace(regex,charStyles[key].getWrapper(key));}
for(key in regexStyles)
{if(!regexStyles.hasOwnProperty(key))
continue;regex=new RegExp('{'+ key+'}','g');realMap=realMap.replace(regex,regexStyles[key].getWrapper("$1"));}
map.innerHTML=preMap+ realMap+ postMap;if(tempIron)
charStyles["▒"]=tempIron;}
function exSend(command)
{sendMessage(command,false);}
function onMessageKey(e)
{if(!gameModeEnabled())
{var regex=/^\s*\/exgamemode\s*$/i;if(e.keyCode==13&&regex.test(e.target.value))
{enableGameMode();commandList.push(e.target.value);}}
else
{if(!this.nextKeyTime)
{this.lastKey=0;this.nextKeyTime=now();}
var character=String.fromCharCode(e.keyCode);if(commandModeEnabled())
{if(isForwardSlash(e.keyCode)||e.keyCode===13||isLastBackspace(e))
{disableCommandMode();if(e.keyCode!==13)
{e.preventDefault();e.target.value="";}}
return;}
else if(sayModeEnabled())
{if(e.keyCode===13||isLastBackspace(e))
{disableSayMode();}
return;}
else if(isForwardSlash(e.keyCode))
{enableCommandMode();return;}
else if(e.keyCode==188)
{enableSayMode();e.preventDefault();return;}
e.preventDefault();if(e.keyCode==13)
{disableGameMode();return;}
if(now()>=this.nextKeyTime)
{if(character==='1')
exSend("/coinget");else if(character==='2')
exSend("/cgamerestock");else if(character==='3')
exSend("/minerrefresh");else if(character==='4')
exSend("/minerpick 50");else if(character==='E')
exSend("/exgo e");else if(character===' ')
exSend("/exgo p");else if(character==='F')
exSend("/exitems");else if(character==='C')
exSend("/excraftlist");if(e.keyCode==37)
exSend("/exgo <");else if(e.keyCode==38)
exSend("/exgo ^");else if(e.keyCode==39)
exSend("/exgo >");else if(e.keyCode==40)
exSend("/exgo v");this.nextKeyTime=now()+ keyInterval;this.lastKey=e.keyCode;}}}})();
123
