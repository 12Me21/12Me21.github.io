window.SBConfig = {
	//internal functions for reading/writing strings.
	//nul-terminated, UCS-2, little endian.
	getSBString: function(dataview,start,maxBytes){
		var string="";
		for(var i=0;i<maxBytes;i+=2){
			var c = dataview.getUint16(start+i,true);
			if(c==0)
				break;
			string+=String.fromCodePoint(c);
		}
		return string;
	},
	setSBString: function(dataview, start, string, maxBytes){
		string = string.substr(0,maxBytes/2-1);
		for(var i=0;i<string.length;i++)
			dataview.setUint16(start+i*2,string.codePointAt(i),true);
		dataview.setUint16(start+string.length*2,0,true);
		return true;
	},
	//
	readConfig: function(config){
		if(config.byteLength != 0x610)
			return null;
		config = new DataView(config);
		return ({
			smileTool: this.getSBString(config,0x004,128),
			activeProject: this.getSBString(config,0x084,28),
			colors: {
				comment: config.getInt32(0x0A4,true),
				keyword: config.getInt32(0x0A8,true),
				string: config.getInt32(0x0AC,true),
				label: config.getInt32(0x0B0,true),
				numeric: config.getInt32(0x0B4,true),
				text: config.getInt32(0x0B8,true),
				statement: config.getInt32(0x600,true),
				background: config.getInt32(0x604,true)
			},
			keyDelay: config.getInt32(0x0BC,true),
			keyInterval: config.getInt32(0x0C0,true),
			textWrap: config.getInt32(0x0C4,true),
			mystery: config.getInt32(0x5F8,true),
			goldMember: config.getInt8(0x608,true)
		})
	},
	writeConfig: function(data){
		var config = new ArrayBuffer(0x610);
		var configView = new DataView(config);
		configView.setInt32(0x000, 0x63334253, false);
		this.setSBString(configView,0x004,data.smileTool,128);
		this.setSBString(configView,0x084,data.activeProject,28);
		configView.setInt32(0x0A4,data.colors.comment,true);
		configView.setInt32(0x0A8,data.colors.keyword,true);
		configView.setInt32(0x0AC,data.colors.string,true);
		configView.setInt32(0x0B0,data.colors.label,true);
		configView.setInt32(0x0B4,data.colors.numeric,true);
		configView.setInt32(0x0B8,data.colors.text,true);
		configView.setInt32(0x600,data.colors.statement,true);
		configView.setInt32(0x604,data.colors.background,true);
		configView.setInt32(0x0BC,data.keyDelay,true);
		configView.setInt32(0x0C0,data.keyInterval,true);
		configView.setInt32(0x0C4,data.textWrap,true);
		configView.setInt32(0x5F8,data.mystery, true);
		configView.setInt32(0x5FC, 0x6D436544, false);
		configView.setInt8(0x608,data.goldMember,true);
		return config;
	},
	//convert between "#RRGGBB" and 0xAARRGGBB formats
	//to use with CSS and <input type="color">
	argbToHex: function(argb){
		return "#"+((argb & 0xFFFFFF) | 0x1000000).toString(16).substr(1)// + (argb>>>8*3 | 0x100).toString(16).substr(1);
	},
	hexToARGB: function(hex){
		return 0xFF000000 | parseInt(hex.substr(1),16);
	}
}
