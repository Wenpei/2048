const contract_address = "0xc8a7ec13f7a5e1ab2bc1bcec46a95ed205513192";

function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart = "MSPointerDown";
    this.eventTouchmove = "MSPointerMove";
    this.eventTouchend = "MSPointerUp";
  } else {
    this.eventTouchstart = "touchstart";
    this.eventTouchmove = "touchmove";
    this.eventTouchend = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    // 75: 0, // Vim up
    // 76: 1, // Vim right
    // 74: 2, // Vim down
    // 72: 3, // Vim left
    // 87: 0, // W
    // 68: 1, // D
    // 83: 2, // S
    // 65: 3  // A
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
      event.shiftKey;
    var mapped = map[event.which];

    if (self.targetIsInput(event)) return;

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }

    // R key restarts the game
    // if (!modifiers /*&& event.which === 82*/) {
    //   self.restart.call(self, event);
    // }
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // Respond to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  //var scoreContainer = document.getElementsByClassName("score-container")[0];

  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
      event.targetTouches.length > 1 ||
      self.targetIsInput(event)) {
      return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
      event.targetTouches.length > 0 ||
      self.targetIsInput(event)) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

function loadJSON(filePath, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          error(xhr);
      }
    }
  };
  xhr.open("GET", filePath, true);
  xhr.send();
}
KeyboardInputManager.prototype.getRecord = function (callback) {
  const web3 = window.web3
  loadJSON("https://wenpei.github.io/2048/contract_abi.json",
    (jsonInterface) => {
      const contractWinner = new web3.eth.Contract(jsonInterface, contract_address)
      web3.eth.getAccounts(
        (error, accounts) => {
          contractWinner.methods.getRecord(accounts[0]).call(
            { from: accounts[0] }
          ).then(
            (result) => callback(result)
          )
        }
      )
    },
    (error) => {
      console.log("read abi failed" + error)
    }
  );
}
KeyboardInputManager.prototype.onChain = function (name, score, callback) {
  const web3 = window.web3
  loadJSON("https://wenpei.github.io/2048/contract_abi.json",
    (jsonInterface) => {
      // const contractWinner = new web3.eth.Contract(jsonInterface, contract_address)
      // web3.eth.getAccounts(
      //   (error, accounts) => {
      //     contractWinner.methods.addRecord(name, score, accounts[0]).send(
      //       { from: accounts[0] }
      //     ).on('transactionHash',
      //       hash => console.log(hash)
      //     ).on('receipt',
      //       receipt => console.log(receipt)
      //     ).on('confirmation', (confirmationNumber, receipt) => {
      //       console.log(receipt)
      //     }).on('error', console.error);
      //   }
      // )

      web3.eth.getAccounts(
        (error, accounts) => {
          const contractWinner = new web3.eth.Contract(jsonInterface, contract_address)
          const data = contractWinner.methods.addRecord(name, score, accounts[0]).encodeABI();
          web3.eth.sendTransaction({
            from: accounts[0],
            to: contract_address,
            value: '0',
            data: data,
            gas: 85200,
            gasPrice: 10000000000
          }, (error, txHash) => {
            callback(error, txHash)
          })
        }
      )
    },
    (error) => {
      console.log("read abi failed" + error)
    }
  );

}
KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  var userNameContainer = document.getElementsByClassName("user-name")[0];
  const name = userNameContainer.value ? userNameContainer.value : "无名大侠"
  this.onChain(name, window.onChainScore,
    (error, txHash) => {
      console.log(txHash);
      console.log(error)
      event.preventDefault();
      this.emit("keepPlaying");
    });
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};

KeyboardInputManager.prototype.targetIsInput = function (event) {
  return event.target.tagName.toLowerCase() === "input";
};