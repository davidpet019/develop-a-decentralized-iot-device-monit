import * as Web3 from 'web3';
import * as EthereumTx from 'ethereumjs-tx';

interface IoTDevice {
  id: string;
  name: string;
  status: boolean;
}

class DecentralizedIoTDeviceMonitor {
  private web3: Web3;
  private contractAddress: string;

  constructor(web3: Web3, contractAddress: string) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
  }

  async getDeviceStatus(deviceId: string): Promise<boolean> {
    const contract = new this.web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [
            {
              name: '_deviceId',
              type: 'string'
            }
          ],
          name: 'getDeviceStatus',
          outputs: [
            {
              name: '',
              type: 'bool'
            }
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function'
        }
      ],
      this.contractAddress
    );

    return contract.methods.getDeviceStatus(deviceId).call();
  }

  async updateDeviceStatus(deviceId: string, status: boolean): Promise<string> {
    const contract = new this.web3.eth.Contract(
      [
        {
          constant: false,
          inputs: [
            {
              name: '_deviceId',
              type: 'string'
            },
            {
              name: '_status',
              type: 'bool'
            }
          ],
          name: 'updateDeviceStatus',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      this.contractAddress
    );

    const txCount = await this.web3.eth.getTransactionCount('0x123456...' /* Your Ethereum account */);
    const tx = new EthereumTx.Transaction({
      from: '0x123456...' /* Your Ethereum account */,
      to: this.contractAddress,
      value: '0x0',
      gas: '0x5208',
      gasPrice: '0x4a817c800',
      nonce: `0x${txCount.toString(16)}`,
      data: contract.methods.updateDeviceStatus(deviceId, status).encodeABI()
    });

    const signedTx = tx.sign('0x123456...' /* Your Ethereum private key */);
    const serializedTx = signedTx.serialize();

    const result = await this.web3.eth.sendTransaction(serializedTx.toString('hex'));
    return result.transactionHash;
  }
}

// Test case
(async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/YOUR_PROJECT_ID'));
  const monitor = new DecentralizedIoTDeviceMonitor(web3, '0x...ContractAddress...');

  const deviceId = ' Device-12345';
  const status = true;

  try {
    const result = await monitor.updateDeviceStatus(deviceId, status);
    console.log(`Transaction Hash: ${result}`);

    const deviceStatus = await monitor.getDeviceStatus(deviceId);
    console.log(`Device ${deviceId} status: ${deviceStatus}`);
  } catch (error) {
    console.error(error);
  }
})();