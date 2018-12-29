(function () {
  window.addEventListener('load', async () => {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        await ethereum.enable();
      } catch (error) {
        console.log("inject web3 denied access")
      }
    }
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
    }
    else {
      window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
      console.log('No web3 instance injected, using Local web3.');
    }
  });
}()
)