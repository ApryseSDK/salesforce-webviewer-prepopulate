/* Salesforce setup start */

var resourceURL = '/resource/'
window.CoreControls.forceBackendType('ems');

var urlSearch = new URLSearchParams(location.hash)
var custom = JSON.parse(urlSearch.get('custom'));
resourceURL = resourceURL + custom.namespacePrefix;

/**
 * The following `window.CoreControls.set*` functions point WebViewer to the
 * optimized source code specific for the Salesforce platform, to ensure the
 * uploaded files stay under the 5mb limit
 */
// office workers
window.CoreControls.setOfficeWorkerPath(resourceURL + 'office')
window.CoreControls.setOfficeAsmPath(resourceURL + 'office_asm');
window.CoreControls.setOfficeResourcePath(resourceURL + 'office_resource');

// pdf workers
window.CoreControls.setPDFResourcePath(resourceURL + 'resource')
if (custom.fullAPI) {
  window.CoreControls.setPDFWorkerPath(resourceURL + 'pdf_full')
  window.CoreControls.setPDFAsmPath(resourceURL + 'asm_full');
} else {
  window.CoreControls.setPDFWorkerPath(resourceURL + 'pdf_lean')
  window.CoreControls.setPDFAsmPath(resourceURL + 'asm_lean');
}

// external 3rd party libraries
window.CoreControls.setExternalPath(resourceURL + 'external')
window.CoreControls.setCustomFontURL('https://pdftron.s3.amazonaws.com/custom/ID-zJWLuhTffd3c/vlocity/webfontsv20/');

/* Salesforce setup end */

/* getting document data without WebViewer instance start */
const licenseKey = 'Insert commercial license key here after purchase';
const documentURL = '/resource/1611759145000/myfiles/webviewer-demo-annotated.pdf'; // Use public link or for Salesforce static resources: replace with import url from '@salesforce/resourceUrl/' to get '/resource/1611759145000/' portion of the link
const extension = 'pdf'; // pass extension to option if there is no file extension in documentURL

// create CoreControls.Document instance
window.CoreControls.createDocument(documentURL, { l: licenseKey, extension })
  .then(doc => {

    // optionally perform some document processing using read write operations 
    // found under 'Editing Page Content' or 'Page Manipulation'

    doc.getFileData().then(data => {
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      
      // add code for handling Blob here
      console.log(blob);
    });
  })
  .catch(err => { })

  /* getting document data without WebViewer instance end */