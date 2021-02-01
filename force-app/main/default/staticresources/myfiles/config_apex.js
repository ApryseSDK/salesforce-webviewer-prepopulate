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

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
  if (event.isTrusted && typeof event.data === 'object') {
    switch (event.data.type) {
      case 'OPEN_DOCUMENT_BLOB':
        const { blob, extension, filename, documentId, account } = event.data.payload;
        event.target.readerControl.loadDocument(blob, { extension, filename, documentId });

        const docViewer = readerControl.docViewer;
        const annotManager = docViewer.getAnnotationManager();

        // standard text flag
        const flags = new Annotations.WidgetFlags();
        flags.set('Multiline', false);
        flags.set('Required', false);

        // multiline address flag
        const addressFlags = new Annotations.WidgetFlags();
        flags.set('Multiline', true);
        flags.set('Required', false);

        let yVal = 142;
        let widgets = [];
        for (const [key, val] of Object.entries(account)) {
          let field = {};
          if(key.toLowerCase().includes('id')) {
            continue;
          } else if(key.toLowerCase().includes('address')) {
            field = new Annotations.Forms.Field(key, {
              type: 'Tx',
              value: val.street,
              addressFlags,
            });
          } else {
            field = new Annotations.Forms.Field(key, {
              type: 'Tx',
              value: val,
              flags,
            });
          }

          // create a widget annotation
          let widgetAnnot = new Annotations.TextWidgetAnnotation(field);
          console.log(field);
          
          // Add customization here
          // Draw rectangle annotation on first page
          // "Annotations" can be directly accessed since we're inside the iframe
          widgetAnnot.PageNumber = 1;
          widgetAnnot.X = 150;
          widgetAnnot.Y = yVal;
          widgetAnnot.Width = 400;
          widgetAnnot.Height = 30;

          //add the form field and widget annotation
          annotManager.addAnnotation(widgetAnnot);
          widgets.push(widgetAnnot);
          annotManager.getFieldManager().addField(field);

          yVal += 60;
        }
        
        annotManager.drawAnnotationsFromList(widgets);
        break;
      default:
        break;
    }
  }
}
