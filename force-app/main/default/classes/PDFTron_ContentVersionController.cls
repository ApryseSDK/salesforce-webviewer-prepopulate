public with sharing class PDFTron_ContentVersionController {
    @AuraEnabled(Cacheable=true)
    public static List<ContentVersionWrapper> getAttachments(String recordId){
        try {
            List<String> cdIdList = new List<String> ();
            List<ContentVersionWrapper> cvwList = new List<ContentVersionWrapper> ();

            //Define supported file extensions
            Set<String> fileFormats = new Set<String> {
                    'pdf', 
                    'xfdf',
                    'fdf',
                    'doc',
                    'docx', 
                    'xlsx',
                    'ppt',
                    'pptx',
                    'jpg',
                    'jpeg',
                    'png',
                    'mov',
                    'tif',
                    'xls',
                    'xlsx'
            };

            Account acc = [SELECT Name, ShippingAddress, SLAExpirationDate__c, Phone FROM Account WHERE Id = :recordId];
            system.debug(acc);
            //Find links between record & document
            for(ContentDocumentLink cdl : 
                    [   SELECT id, ContentDocumentId, ContentDocument.LatestPublishedVersionId 
                        FROM ContentDocumentLink 
                        WHERE LinkedEntityId = :recordId    ]) {
                cdIdList.add(cdl.ContentDocumentId);
            }
            system.debug('cdIdList: ' + cdIdList);
            //Use links to get attachments
            for(ContentVersion cv : 
                    [   SELECT Id, Title,FileExtension, VersionData 
                        FROM ContentVersion 
                        WHERE ContentDocumentId IN :cdIdList 
                        AND IsLatest = true ]) {
                if(fileFormats.contains(cv.FileExtension.toLowerCase())) {
                    System.debug('Converting CV: ' + cv.Id);
                    cvwList.add(new ContentVersionWrapper(cv, acc));
                    System.debug('Completed CV Conversion:' + cv);
                }
            }
            system.debug(cvwList);
            return cvwList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class ContentVersionWrapper {
        @AuraEnabled
        public String name {get; set;}
        @AuraEnabled
        public String body {get; set;}
        @AuraEnabled
        public ContentVersion cv;
        @AuraEnabled
        public Account acc {get; set;}
        
        public ContentVersionWrapper(ContentVersion contentVer, Account acc) {
            this.cv = contentVer;
            this.name = contentVer.Title + '.' + contentVer.FileExtension;
            this.body = EncodingUtil.base64Encode(contentVer.VersionData);
            this.acc = acc;
        }
    }
}
