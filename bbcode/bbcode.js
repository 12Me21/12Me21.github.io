//spoiler functions stolen from SBS
function spoilerToggle(toggler){
  while (!toggler.hasAttribute("data-spoiler") && toggler.tagName !== "BODY")
    toggler = toggler.parentNode;
  var section = toggler;
  while (section.tagName !== "SPOILER-SECTION" && section.tagName !== "BODY")
    section = section.parentNode;
  if (!section || section.tagName === "BODY") {
    console.log("Bad spoiler section!");
    return;
  }
  setSpoilerState(section, !toggler.hasAttribute("data-show"));
}

function setSpoilerState(spoiler, show){
   var i, filler;
   var content = spoiler.querySelector("spoiler-content");
   var toggler = spoiler.querySelector("[data-spoiler]");
   var ignoreOverflow = spoiler.hasAttribute("data-ignoreoverflow");

   if(!content){
      console.log("No spoiler content!");
      return;
   }else if(!toggler){
      console.log("No toggler element!");
      return;
   }

   //Show or hide the spoiler
   if(show) {
      //Before you do ANYTHING else, hide all the other sibling spoilers within
      //the same spoiler group.
      if(spoiler.hasAttribute("data-togglegroup")){
         var toggleGroupSpoilers = spoiler.parentNode.querySelectorAll('[data-togglegroup="' + spoiler.dataset.togglegroup + '"]');

         //Now for each spoiler in the group, force it to hide!
         for(i = 0; i < toggleGroupSpoilers.length; i++)
            setSpoilerState(toggleGroupSpoilers[i], false);
      }

      if(ignoreOverflow){
         quietlog("Ignore overflow. Set style");
         var matchID = "filler_" + Date.now();
         filler = createFillerForElement(spoiler);
         filler.id = matchID;
         spoiler.setAttribute("data-filler", matchID);
         spoiler.style.position = "absolute";
         insertAfter(spoiler.parentNode, filler, spoiler);

         if(!isSupportedBrowser() || spoiler.offsetLeft !== filler.offsetLeft || spoiler.offsetTop !== filler.offsetTop){
            console.log("Fixing weird shifting error");
            spoiler.style.left = filler.offsetLeft + "px";
            spoiler.style.top = filler.offsetTop + "px";
         }
      }

      if(toggler.innerHTML.indexOf("Show") === 0)
         toggler.innerHTML = toggler.innerHTML.replace(/\bShow\b/g, "Hide");
      toggler.setAttribute("data-show", "");
      content.setAttribute("data-show", "");
   }else{
      if(toggler.innerHTML.indexOf("Hide") === 0)
         toggler.innerHTML = toggler.innerHTML.replace(/\bHide\b/g, "Show");
      toggler.removeAttribute("data-show");
      content.removeAttribute("data-show");

      if(ignoreOverflow){
         quietlog("Ignore overflow. Remove style");
         spoiler.removeAttribute("style");
         filler = document.getElementById(spoiler.getAttribute("data-filler"));

         if(filler)
            removeSelf(filler);
      }
   }
}

var tagTable=[
	{name:"table",open:"<table rules=\"all\"><tr><td>",close:"</td></tr></table>",block:true},
	{name:"col",open:"</td><td>",block:true},
	{name:"row",open:"</td></tr><tr><td>",block:true},
	{name:"code",open:"<code>",close:"</code>",code:true,block:true},
	{name:"icode",open:"<inline-code>",close:"</inline-code>",code:3},
	
	{name:"i",open:"<i>",close:"</i>"},
	{name:"b",open:"<b>",close:"</b>"},
	{name:"u",open:"<u>",close:"</u>"},
	{name:"s",open:"<s>",close:"</s>"},
	{name:"sup",open:"<sup>",close:"</sup>"},
	{name:"sub",open:"<sub>",close:"</sub>"},
	
	{
		name:"img",
		block:true,
		openFunction:true,
		open:function(attribute){
			return '<img alt="'+escapeHtmlAttribute(attribute||"")+'" src="';
		},
		close:'">'
	},
	
	{
		name:"quote",
		block:true,
		openFunction:true,
		open:function(attribute){
			return '<blockquote cite="'+escapeHtmlAttribute(attribute||"")+'">';
		},
		close:"</blockquote>"
	},
	
	{
		name:"spoiler",
		block:true,
		openFunction:true,
		open:function(attribute){
			return '<spoiler-section><button data-spoiler="" onclick="spoilerToggle(this)">Show '+escapeHtml(attribute||"spoiler")+"</button><br><spoiler-content>";
		},
		close:"</spoiler-content></spoiler-section>"
	},
	
	{
		name:"url",
		openFunction:true,
		open:function(attribute){
			return '<a href="'+(attribute||"")+'">';
		},
		close:"</a>"
	}
]

function escapeHtml(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");
}
function escapeHtmlAttribute(text){
	return text.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
}
	
function array(length){
	var array=new Array(length);
	for(var i=0;i<length;i++){
		array[i]=0;
	}
	return array;
}
	
function parseBBCode(input){
	var c;
	var i;
	var text="";
	var insideCode=-1;
	
	function next(){
		jump(i+1);
	}
	
	function jump(pos){
		i=pos;
		c=input.charAt(i);
	}
	
	var openedTags=array(tagTable.length);
	var tagStart,tagEnd,tagNameStart,tagNameEnd,propertyStart,propertyEnd,closing;
	function htmlTag(){
		//tag name
		var tagName=input.substring(tagNameStart,tagNameEnd).toLowerCase();
		var tagIndex,tagInfo
		//find tag data in table
		for(var i=0;i<tagTable.length;i++){
			if(tagTable[i].name==tagName){
				tagIndex=i;
				tagInfo=tagTable[tagIndex];
				break;
			}
		}
		//if invalid tag, or invalid closing tag, or invalid opening tag:
		if(!tagInfo || closing&&!tagInfo.close || !closing&&!tagInfo.open){
			jump(tagStart+1);
			return "[";
		}
		//if closing tag for current code block
		if(closing && insideCode==tagIndex){
			insideCode=-1;
		}
		//if still inside code, don't continue parsing
		if(insideCode>=0 || closing && openedTags[tagInfo.index]<1){
			jump(tagStart+1);
			return "[";
		}
		//closing tag
		if(closing){
			openedTags[tagIndex]--;
		//opening tag that can be closed
		}else if(tagInfo.close){
			openedTags[tagIndex]++;
		}
		//remove line breaks at start/end of blocks
		if(tagInfo.block && c=="\n"){
			next();
		}
		//if opening code tag
		if(!closing && tagInfo.code){
			insideCode=tagIndex;
		}
		//finally return the html
		if(closing){
			return tagInfo.close;
		}else{
			if(tagInfo.openFunction){
				return tagInfo.open(input.substring(propertyStart,propertyEnd));
			}else{
				return tagInfo.open;
			}
		}
	}	
	
	jump(0);
	
	while(c){
		tagStart=i;
		//tag
		if(c=="["){
			next();
			// closing tag marker
			if(c=="/"){
				next();
				closing=true;
			}else{
				closing=false;
			}
			tagNameStart=i;
			// tag name
			while(isTagNameChar(c)){
				next();
			}
			tagNameEnd=i;
			propertyStart=i;
			//opening tag with property
			if(!closing && c=="="){
				var bracketLevel=0
				next();
				propertyStart++;
				//scan property value
				while(c){
					if(c=="["){
						bracketLevel++;
					}else if(c=="]"){
						if(bracketLevel==0){
							break;
						}
						bracketLevel--;
					}
					next();
				}
			}
			propertyEnd=i;
			//end of tag
			if(c=="]"){
				next();
				tagEnd=i;
				text+=htmlTag(closing);
			//reached end of bbcode without finding ]
			}else{
				jump(tagStart+1);
				text+="[";
			}
		}else{
			//read chracters until [ or end of input;
			while(c && c!="["){
				next();
			}
			text+=escapeHtml(input.substring(tagStart,i));
		}
	}
	for(i=0;i<openedTags.length;i++){
		if(openedTags[i]){
			return escapeHtml(input);
		}
	}
	return text;
}

//this is fine as long as it doesn't accept ] or = or nothing. (any more filtering is just optimization)
function isTagNameChar(c){
	return c>="A"&&c<="Z" || c>="a"&&c<="z" || c=="*";
}
