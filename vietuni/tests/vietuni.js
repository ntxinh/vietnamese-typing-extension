/*
 * Author: ntxinh (nguyentrucxjnh@gmail.com)
 * Date: May 21, 2025
 * Description: Add support Vietnamese typing for contenteditable attribute
 */

/**
 * Initializes a new instance of the VietUni class.
 *
 * @param int mode  Vietnamese typing method: 1=telex, 2=vni, 3=viqr, 4=all(default), otherwise=off
 */
function vietUni(mode) {
  if (document.all || document.getElementById) {
    this.method = (mode == undefined || mode == null) ? 4 : mode;
    return this;
  }
  alert("Xin loi, trinh duyet web cua ban khong cho phep dung VietTyping.");
  return false;
}

/**
 * Sets Vietnamese typing method
 */
vietUni.prototype.setMethod = function(mode) {
  this.method = mode;
  if (this.typer) this.typer.keyMode = this.initKeys();
};

vietUni.prototype.initKeys = function() {
  switch (this.method) {
    case 1:
      if (!this.telexKeys) this.telexKeys = new vietKeysTelex();
      return this.telexKeys;

    case 2:
      if (!this.vniKeys) this.vniKeys = new vietKeysVni();
      return this.vniKeys;

    case 3:
      if (!this.viqrKeys) this.viqrKeys = new vietKeysViqr();
      return this.viqrKeys;

    case 4:
      if (!this.allKeys) this.allKeys = new vietKeysAll();
      return this.allKeys;

    default:
      if (!this.vkOff) this.vkOff = new vietKeysOff();
      return this.vkOff;
  }
};

/**
 * Initializes Vietnamese typer for an editable element (textbox, textarea, iframe.document)
 */
vietUni.prototype.initTyper = function(el) {
  // validates parameters
  if (!el) return;

  if (!this.typer) {
    this.typer = new vietTyper();
    this.typer.keyMode = this.initKeys();
  }

  var self = this;
  if (el.attachEvent) {
    el.attachEvent("onkeypress", function(evt) {
      return vietUni.vietTyping(evt, self, el);
    });
  }
  else if (el.addEventListener) {
    el.addEventListener("keypress", function(evt) {
      return vietUni.vietTyping(evt, self, el);
    }, true);
  }
  else if (el.onkeypress) {
    var oldFunc = el.onkeypress;
    if (typeof oldFunc !== "function") {
      el.onkeypress = function(evt) {
        return vietUni.vietTyping(evt, self, el);
      };
    }
    else {
      el.onkeypress = function(evt) {
        return (!oldFunc(evt)) ? false : vietUni.vietTyping(evt, self, el);
      };
    }
  }
};

/**
 * Handles key-press event of the editable element
 */
vietUni.vietTyping = function(evt, vUni, el) {
  // validates parameters
  if (!vUni || vUni.typer.keyMode.off) return true;

  // event fixing
  if (!evt) evt = event;

  // retrieves pressed key code
  var c = document.all ? evt.keyCode : (evt.which || evt.charCode);
  // out of typeable keys range
  if (c < 49 && c != 16 && c != 20) return true;

  // retrieves the current word
  var len, s = vUni.getCurrentWord(el);
  if (s == null || (len = s.length) < 1 || s.match(/\s+$/)) return true;

  // replaces with Vietnamese word
  vUni.typer.value = s;
  if (c > 32 && vUni.typer.typing(c)) {
    // found an increment of the word length
    if (((s = vUni.typer.value).length == len + 1) && c == s.charCodeAt(len)) {
      // fixs length of the replacement word
      vUni.typer.value = s.substr(0, len);
      len = 0;
    }
    vUni.replaceWord(el, vUni.typer.value);

    // cancels the current key
    if (len > 0) {
      if (typeof evt.cancelBubble !== "undefined") {
        evt.cancelBubble = true;
      }
      if (evt.stopPropagation) {
        evt.preventDefault();
        evt.stopPropagation();
      }
      return false;
    }
  }

  return (!evt.cancelBubble);
};

vietUni.prototype.getCurrentWord = function(el) {
  // for IE / Opera textbox
  if (document.selection && !el.createRange) {
    var caret = (!el.selection) ? el.document.selection.createRange() : el.selection.createRange();
    // is selected ?
    if (caret.text) return null;

    var caret2;
    try {
      caret2 = caret.duplicate();
      caret2.moveStart("word", -1);
    } catch(e) {
      var backward = -10;
      do {
        caret2 = caret.duplicate();
        caret2.moveStart("character", backward++);
      }
      while (!caret2.text && backward < 0);
    }

    el.curWord = caret2.duplicate();

    return caret2.text;
  }
  // for Firefox textbox
  else if (el.setSelectionRange) {
    var p1 = el.selectionStart, p2 = el.selectionEnd;
    // is selected ?
    if (p1 != p2) return null;

    p1 = Math.max(0, p2 - 10);
    el.pos1 = p1;
    el.pos2 = p2;

    return el.value.substr(p1, p2 - p1);
  }
  // for Firefox / Opera iframe.document
  else if (window.getSelection && el.defaultView) {
    var sel = el.defaultView.getSelection();
    var rng = sel.getRangeAt(sel.rangeCount - 1).cloneRange();

    // is selected ?
    if (rng.toString()) return null;

    // get neareat word
    var p2 = rng.startOffset, nod = rng.endContainer;
    rng.setEnd(nod, p2);
    rng.setStart(nod, Math.max(0, p2 - 10));

    // store current word
    el.rng1 = rng;
    el.nod1 = nod;
    el.pos1 = rng.startOffset;
    el.pos2 = p2;

    var txt = rng.toString();
    // restore caret position
    rng.setStart(nod, p2);

    return txt;
  }
  else if (typeof el.value !== "undefined") {
    return el.value;
  }
  else if (el && el.getAttribute('contenteditable')) {
    // Get the current selection
    const selection = window.getSelection();

    // Check if the selection is within the provided element
    if (!el.contains(selection.anchorNode)) {
        return null;
    }

    // Get the range of the selection
    const range = selection.getRangeAt(0);

    // Check if the selection is collapsed (no text selected, just a cursor)
    if (!range.collapsed) {
        return null;
    }

    // Get the cursor position
    const tempRange = document.createRange();
    tempRange.selectNodeContents(el);
    tempRange.setEnd(range.endContainer, range.endOffset);
    const p2 = tempRange.toString().length; // Cursor position (end of selection)

    // Calculate the start position (up to 10 characters before the cursor)
    const p1 = Math.max(0, p2 - 10);

    // Store positions on the element for reference
    el.pos1 = p1;
    el.pos2 = p2;

    // Extract the text from the element
    const text = el.textContent;

    // Return the substring from p1 to p2
    return text.substring(p1, p2);
  }

  return null;
};

vietUni.prototype.replaceWord = function(el, newWord) {
  // for IE / Opera textbox
  if (document.selection && !el.createRange && el.curWord) {
    el.curWord.text = newWord;
    el.curWord.collapse(false);
  }
  // for Firefox textbox
  else if (el.setSelectionRange) {
    var p1 = el.pos1, p2 = el.pos2, txt = el.value;
    el.value = txt.substr(0, p1) + newWord + txt.substr(p2);
    //
    el.setSelectionRange(p1 + newWord.length, p1 + newWord.length);
  }
  // for Firefox / Opera iframe.document
  else if (window.getSelection && el.nod1 && el.nod1.insertData) {
    el.rng1.setStart(el.nod1, el.pos1);
    //alert(newWord + ':' + el.pos1 + ':' + el.pos2);
    el.nod1.insertData(el.pos1, newWord);
    el.nod1.deleteData(el.pos1 + newWord.length, el.pos2 - el.pos1);

    // move cursor to the end
    el.rng1.setEnd(el.nod1, el.pos2);
    el.rng1.setStart(el.nod1, el.pos2);
  }
  else if (typeof el.value !== "undefined") {
    el.value = newWord;
  }
  else if (el && el.getAttribute('contenteditable')) {
    const cursorPosition = getCursorPosition(el);

    var p1 = el.pos1, p2 = el.pos2, txt = el.textContent;
    el.textContent = txt.substr(0, p1) + newWord + txt.substr(p2);

    if (txt.length == el.pos2) {
      // If typing at the end of div, move cursor to the end
      setCursorPositionAtTheEnd(el);
    } else {
      // If typing at the start or middle of div, move cursor to the correct position
      setCursorPosition(el, cursorPosition);
    }
  }
};

/*---------- START: Support for contenteditable div ----------*/
// Get cursor position
function getCursorPosition(el) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (el.contains(range.startContainer)) {
      return range.startOffset;
    }
  }
  return -1;
}

// Set cursor position
function setCursorPosition(el, offset) {
  const range = document.createRange();
  const selection = window.getSelection();
  const textNode = el.firstChild.nodeType === Node.TEXT_NODE
    ? el.firstChild
    : el.childNodes[0];

  if (!textNode || offset < 0 || offset > textNode.length) {
    console.error('Invalid offset or no text node found');
    return;
  }

  range.setStart(textNode, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  el.focus();
}

// Set cursor position at the end
function setCursorPositionAtTheEnd(el) {
  el.focus();
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false); // false moves the cursor to the end
  selection.removeAllRanges();
  selection.addRange(range);
}
/*---------- END: Support for contenteditable div ----------*/

/*---------- VietTyper class ----------*/
function vietTyper() {
  this.value = "";
  this.charMap = new vietUnicodeMap();
  this.ctrlChar = '-';
  this.changed = 0;
  return this;
}

vietTyper.prototype.typing = function(ctrl) {
  //if (this.keyMode.off) return 0;
  this.changed = 0;
  this.ctrlChar = String.fromCharCode(ctrl);
  this.keyMode.getAction(this);

  this.correct();
  return this.changed;
};

vietTyper.prototype.compose = function(typ) {
  if (!this.value) return;

  var info = this.findCharToChange(typ);
  if (!info || !info[0]) return;

  var telex;
  if (info[0] == '\\') {
    telex = [1, this.ctrlChar, 1];
  }
  else if (typ > 6) {
    telex = this.charMap.getAEOWD(info[0], typ, info[3]);
  }
  else {
    telex = this.charMap.getDau(info[0], typ);
  }
  if (!(this.changed = telex[0])) return;

  // replace a character at info[1]
  this.value = this.value.substr(0, info[1]) + telex[1] + this.value.substr(info[1] + info[2]);

  // spell error
  if (!telex[2]) this.value += this.ctrlChar;
};

vietTyper.prototype.correct = function() {
  //if (!document.all) return 0;
  var val = this.value;
  if ('nNcC'.indexOf(this.ctrlChar) >= 0) val += this.ctrlChar;

  var er = /[^\x01-\x7f](hn|hc|gn)$/i.exec(val);
  if (er) {
    this.value = val.substr(0, val.length - 2) + er[1].charAt(1) + er[1].charAt(0);
    this.changed = 1;
  }
  else if (!this.changed) {
    return 0;
  }

  er = /\w([^\x01-\x7f])(\w*)([^\x01-\x7f])\S*$/.exec(this.value);
  if (!er) return 0;

  var i = this.charMap.isVowel(er[1]);
  var ri = (i - 1) % 24 + 1, ci = (i - ri) / 24;
  var i2 = this.charMap.isVowel(er[3]);
  if (!ci || !i2) return 0;

  var ri2 = (i2 - 1) % 24 + 1;
  var nc = this.charMap.charAt(ri) + er[2] + this.charMap.charAt(ci * 24 + ri2);
  //
  this.value = this.value.replace(new RegExp(er[1] + er[2] + er[3], 'g'), nc);
};

vietTyper.prototype.findCharToChange = function(typ) {
  var lastChars = this.charMap.lastCharsOf(this.value, 5);
  //
  var i = 0, c = lastChars[0][0], chr = 0;
  if (c == '\\') return [c, this.value.length - 1, 1];

  if (typ == 15) {
    while (!(chr = this.charMap.isVD(c))) {
      if ((c < 'A') || (i >= 4) || !(c = lastChars[++i][0])) return null;
    }
  } else {
    while ("cghmnptCGHMNPT".indexOf(c) >= 0) {
      if ((c < 'A') || (i >= 2) || !(c = lastChars[++i][0])) return null;
    }
  }
  c = lastChars[0][0].toLowerCase();

  var pc = lastChars[1][0].toLowerCase();
  var ppc = lastChars[2][0].toLowerCase();
  //
  if (i == 0 && typ != 15) {
    if ((chr = this.charMap.isVowel(lastChars[1][0])) && ("uyoia".indexOf(c) >= 0)
      && !this.charMap.isUO(pc, c) && !((pc == 'o' && c == 'a') || (pc == 'u' && c == 'y'))
      && !((ppc == 'q' && pc == 'u') || (ppc == 'g' && pc == 'i'))) i++;
    //
    if (c == 'a' && (typ == 9 || typ == 7)) i = 0;
  }
  c = lastChars[i][0];

  if ((i == 0 || chr == 0) && typ != 15) chr = this.charMap.isVowel(c);
  if (!chr) return null;

  var clen = lastChars[i][1], isuo = 0;
  //
  if ((i > 0) && (typ == 7 || typ == 8 || typ == 11)) {
    isuo = this.charMap.isUO(lastChars[i + 1][0], c);
    if (isuo) {
      chr = isuo;
      clen += lastChars[++i][1];
      isuo = 1;
    }
  }

  var pos = this.value.length;
  for (var j = 0; j <= i; j++) pos -= lastChars[j][1];

  return [chr, pos, clen, isuo];
};
/*---------- End of VietTyper class ----------*/

/*---------- VietCharMap class ----------*/
function vietCharMap() {
  // properties
  this.vietChars = null;
  this.length = 149;
  this.chrCache = new Array(20);
  this.indCache = new Array(20);
  this.cptr = 0;
  // methods
  this.caching = function(chr, ind) {
    this.chrCache[this.cptr] = chr;
    this.indCache[this.cptr++] = ind;
    this.cptr %= 20;
  };
  // constants
  this.vmap = [[7, 7, 7, 8, 8, 8, 9, 10, 11, 15],
              [0, 3, 6, 0, 6, 9, 0, 3, 6, 0],
              [1, 4, 7, 2, 8, 10, 1, 4, 7, 1]];
  return this;
}

vietCharMap.prototype.charAt = function(ind) {
  var chrCode = this.vietChars[ind];

  return chrCode ? String.fromCharCode(chrCode) : null;
};

vietCharMap.prototype.isVowel = function(chr) {
  var i = 0;
  while ((i < 20) && (chr != this.chrCache[i])) i++;

  if (i < 20) return this.indCache[i];

  i = this.length - 5;
  while ((chr != this.charAt(i)) && i) i--;

  this.caching(chr, i);

  return i;
};

vietCharMap.prototype.isVD = function(chr) {
  var ind = this.length - 5;

  while ((chr != this.charAt(ind)) && (ind < this.length)) ind++;

  return (ind < this.length) ? ind: 0;
};

vietCharMap.prototype.isUO = function(c1, c2) {
  if (!c1 || !c2) return 0;

  var ind1 = this.isVowel(c1);
  var ci = (ind1 - 1) % 12;
  if ((ci != 9) && (ci != 10)) return 0;

  var ind2 = this.isVowel(c2);
  ci = (ind2 - 1) % 12;
  if ((ci != 6) && (ci != 7) && (ci != 8)) return 0;

  return [ind1, ind2];
};

vietCharMap.prototype.getDau = function(ind, typ) {
  var accented = (ind < 25) ? 0: 1;
  var indI = (ind - 1) % 24 + 1;
  var charSet = (typ == 6) ? 0: typ;

  if ((typ == 6) && !accented) return [0];

  var newInd = charSet * 24 + indI;
  if (newInd == ind) newInd = indI;

  var chr = this.charAt(newInd);
  if (!chr) chr = this.lowerCaseOf(0, newInd);

  return [1, chr, newInd > 24 || typ == 6];
};

vietCharMap.prototype.getAEOWD = function(ind, typ, isuo) {
  var c = 0, i1 = isuo ? ind[0] : ind;
  var vc1 = (typ == 15) ? (i1 - 1) % 2 : (i1 - 1) % 12;

  if (isuo) {
    var base = ind[1] - (ind[1] - 1) % 12;

    if (typ == 7 || typ == 11) {
      c = this.charAt(i1 - vc1 + 9) + this.charAt(base + 7);
    }
    else if (typ == 8) {
      c = this.charAt(i1 - vc1 + 10) + this.charAt(base + 8);
    }

    return [c != 0, c, 1];
  }

  var i = -1, shif = 0, del = 0;

  while (shif == 0 && ++i < this.vmap[0].length) {
    if (this.vmap[0][i] == typ) {
      if (this.vmap[1][i] == vc1) {
        shif = this.vmap[2][i] - vc1;
      }
      else if (this.vmap[2][i] == vc1) {
        shif = this.vmap[1][i] - vc1;
      }
    }
  }

  if (shif == 0) {
    if (typ == 7 && (vc1 == 2 || vc1 == 8)) shif = -1;
    else if ((typ == 9 && vc1 == 2) || (typ == 11 && vc1 == 8)) shif = -1;
    else if (typ == 8 && (vc1 == 1 || vc1 == 7)) shif = 1;

    del = 1;
  }
  else {
    del = (shif > 0);
  }

  i1 += shif;
  var chr = this.charAt(i1);

  if (i1 < 145) this.caching(chr, i1);
  if (!chr) chr = this.lowerCaseOf(0, i1);

  return [shif != 0, chr, del];
};

vietCharMap.prototype.lastCharsOf = function(str, len) {
  if (!len) return [str.charAt(str.length - 1), 1];

  var vchars = new Array(len);
  for (var i = 0; i < len; i++) {
    vchars[i] = [str.charAt(str.length - i - 1), 1];
  }
  return vchars;
};
/*---------- End of VietCharMap class ----------*/

/*---------- VietUnicodeMap class ----------*/
function vietUnicodeMap() {
  var vcmap = new vietCharMap();
  vcmap.vietChars = new Array("UNICODE", 97, 226, 259, 101, 234, 105, 111, 244,
    417, 117, 432, 121, 65, 194, 258, 69, 202, 73, 79, 212, 416, 85, 431, 89,
    225, 7845, 7855, 233, 7871, 237, 243, 7889, 7899, 250, 7913, 253, 193,
    7844, 7854, 201, 7870, 205, 211, 7888, 7898, 218, 7912, 221, 224, 7847,
    7857, 232, 7873, 236, 242, 7891, 7901, 249, 7915, 7923, 192, 7846, 7856,
    200, 7872, 204, 210, 7890, 7900, 217, 7914, 7922, 7841, 7853, 7863, 7865,
    7879, 7883, 7885, 7897, 7907, 7909, 7921, 7925, 7840, 7852, 7862, 7864,
    7878, 7882, 7884, 7896, 7906, 7908, 7920, 7924, 7843, 7849, 7859, 7867,
    7875, 7881, 7887, 7893, 7903, 7911, 7917, 7927, 7842, 7848, 7858, 7866,
    7874, 7880, 7886, 7892, 7902, 7910, 7916, 7926, 227, 7851, 7861, 7869,
    7877, 297, 245, 7895, 7905, 361, 7919, 7929, 195, 7850, 7860, 7868, 7876,
    296, 213, 7894, 7904, 360, 7918, 7928, 100, 273, 68, 272);
  return vcmap;
}
/*---------- End of VietUnicodeMap class ----------*/

/*---------- VietKeys classes ----------*/
function vietKeys() {
  this.getAction = function(typer) {
    var i = this.keys.indexOf(typer.ctrlChar.toLowerCase());
    if (i >= 0) typer.compose(this.actions[i]);
  };
  return this;
}
function vietKeysOff() {
  this.off = true;
  this.getAction = function(typer) {};
  return this;
}

function vietKeysTelex() {
  var k = new vietKeys();
  k.keys = "sfjrxzaeowd";
  k.actions = [1, 2, 3, 4, 5, 6, 9, 10, 11, 8, 15];
  return k;
}
function vietKeysVni() {
  var k = new vietKeys();
  k.keys = "0123456789";
  k.actions = [6, 1, 2, 4, 5, 3, 7, 8, 8, 15];
  return k;
}
function vietKeysViqr() {
  var k = new vietKeys();
  k.keys = "\xB4/'\u2019`.?~-^(*+d";
  k.actions = [1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 15];
  return k;
}
function vietKeysAll() {
  var k = new vietKeys();
  k.keys = "sfjrxzaeowd0123456789\xB4/'`.?~-^(*+d";
  k.actions = [1, 2, 3, 4, 5, 6, 9, 10, 11, 8, 15, 6, 1, 2, 4, 5, 3, 7, 8, 8,
              15, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 15];
  return k;
}
/*---------- End of VietKeys classes ----------*/
