import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

export default class PdftronWebviewerContainer extends LightningElement {
    @api recordId;
    @wire(CurrentPageReference) pageRef;
    @track acc;

    connectedCallback() {
        registerListener('accountData', this.handleAccountData, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

  handleAccountData(account) {
    this.acc = JSON.parse(account);
    //this.iframeWindow.postMessage({type: 'SHOW_ACCOUNT_DATA', payload} , '*');
  }
}