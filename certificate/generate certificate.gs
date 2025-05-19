function hashSecret(input) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  return Utilities.base64Encode(bytes);
}

function generateAndSendCertificates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const templateId = '1WXtIISh_9SqTpfRLmfi7CN_UBZLvFKmRrR56GVoVDEM';
  const folderId = '1gUpKlozctRfto0etYYJiQww6NCzAqwGL';
  const domain = 'https://r9wsd9r8-8000.inc1.devtunnels.ms';
  const today = new Date();
  const issuedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  let certNumber = 1;

  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const college = data[i][1];
    const role = data[i][2];
    const start = data[i][3];
    const end = data[i][4];
    const email = data[i][5];
    let certificateId = data[i][6];
    let alreadyIssued = data[i][8];

    if (alreadyIssued === 'Sent') continue;

    if (!certificateId || certificateId === '') {
      certificateId = `CERT-${issuedDate.replace(/-/g, '')}-${String(certNumber).padStart(3, '0')}`;
      certNumber++;
    }

    // Step 1: Create two separate copies
    const originalCopy = DriveApp.getFileById(templateId).makeCopy(`${name}_Final_Certificate`, DriveApp.getFolderById(folderId));
    const tempCopy = DriveApp.getFileById(templateId).makeCopy(`${name}_Temp_Certificate`, DriveApp.getFolderById(folderId));

    // Step 2: Modify temp copy with verified.png
    const tempPresentation = SlidesApp.openById(tempCopy.getId());
    const tempSlide = tempPresentation.getSlides()[0];

    tempSlide.replaceAllText('{{NAME}}', name);
    tempSlide.replaceAllText('{{COLLEGE}}', college);
    tempSlide.replaceAllText('{{ROLE}}', role);
    tempSlide.replaceAllText('{{START}}', start);
    tempSlide.replaceAllText('{{END}}', end);
    tempSlide.replaceAllText('{{CERTIFICATE ID}}', certificateId);
    tempSlide.replaceAllText('{{ISSUED DATE}}', issuedDate);

    // Replace {{qrcode}} with verified.png
    const verifiedFileId = '1BpM_4HPDtcyoJbYzBkZUx6PWqNCxpjel';
    const verifiedImage = DriveApp.getFileById(verifiedFileId).getBlob().setName('verified.png');

    const tempShapes = tempSlide.getShapes();
    let qrX = 0, qrY = 0, qrWidth = 100, qrHeight = 100;

    for (let j = 0; j < tempShapes.length; j++) {
      if (tempShapes[j].getText !== undefined) {
        const textRange = tempShapes[j].getText();
        if (textRange && textRange.asString().includes('{{qrcode}}')) {
          qrX = tempShapes[j].getLeft();
          qrY = tempShapes[j].getTop();
          qrWidth = tempShapes[j].getWidth();
          qrHeight = tempShapes[j].getHeight();
          tempShapes[j].remove();

          const img = tempSlide.insertImage(verifiedImage);
          img.setLeft(qrX).setTop(qrY).setWidth(qrWidth).setHeight(qrHeight);
          break;
        }
      }
    }

    tempPresentation.saveAndClose();

    const pdfForBackend = DriveApp.getFileById(tempCopy.getId()).getAs('application/pdf');

    // Send to backend
    const apiUrl = `${domain}/api/certificates/upload-certificate`;
    const secret = '321BJVEU2G82424438GB';
    const timestamp = new Date().toISOString();
    const hashedSecret = hashSecret(secret + timestamp);

    const metadata = {
      name,
      college,
      role,
      start,
      end,
      email,
      certificateId,
      issuedDate,
      auth: hashedSecret,
      timestamp
    };

    let qrUrl = '';
    try {
      const response = sendCertificateToBackend(pdfForBackend, metadata, apiUrl);
      if (response.qrUrl) {
        qrUrl = response.qrUrl;
        sheet.getRange(i + 1, 10).setValue(qrUrl);
      }
    } catch (error) {
      Logger.log('API Error: ' + error);
    }

    // Step 3: Add actual QR code to original copy
    if (qrUrl && qrUrl !== '') {
      try {
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;
        const qrImage = UrlFetchApp.fetch(qrApi).getBlob().setName('qrcode.png');

        const finalPresentation = SlidesApp.openById(originalCopy.getId());
        const finalSlide = finalPresentation.getSlides()[0];

        finalSlide.replaceAllText('{{NAME}}', name);
        finalSlide.replaceAllText('{{COLLEGE}}', college);
        finalSlide.replaceAllText('{{ROLE}}', role);
        finalSlide.replaceAllText('{{START}}', start);
        finalSlide.replaceAllText('{{END}}', end);
        finalSlide.replaceAllText('{{CERTIFICATE ID}}', certificateId);
        finalSlide.replaceAllText('{{ISSUED DATE}}', issuedDate);
        finalSlide.replaceAllText('{{qrcode}}', ''); // Optional cleanup if still exists

        const qrImg = finalSlide.insertImage(qrImage);
        qrImg.setLeft(qrX).setTop(qrY).setWidth(qrWidth).setHeight(qrHeight);

        finalPresentation.saveAndClose();

        const updatedPdf = DriveApp.getFileById(originalCopy.getId()).getAs('application/pdf');

        GmailApp.sendEmail(email, 'Your Certificate', `Hi ${name},\n\nPlease find your certificate attached.\n\nRegards,\nYour Team`, {
          attachments: [updatedPdf],
          name: 'Hugo Technologies'
        });

      } catch (error) {
        Logger.log('QR Insert Error: ' + error);
      }
    }

    // Update Sheet
    sheet.getRange(i + 1, 7).setValue(certificateId);
    sheet.getRange(i + 1, 8).setValue(issuedDate);
    sheet.getRange(i + 1, 9).setValue('Sent');
  }
}

function sendCertificateToBackend(pdfBlob, metadata, apiUrl) {
  const namedBlob = pdfBlob.setName("certificate.pdf").setContentType("application/pdf");

  const formData = {
    certificate: namedBlob,
    name: metadata.name,
    college: metadata.college,
    role: metadata.role,
    start: metadata.start,
    end: metadata.end,
    email: metadata.email,
    certificateId: metadata.certificateId,
    issuedDate: metadata.issuedDate,
    auth: metadata.auth,
    timestamp: metadata.timestamp
  };

  const options = {
    method: 'post',
    payload: formData,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(apiUrl, options);
  const responseText = response.getContentText();
  Logger.log("Backend response: " + responseText);
  return JSON.parse(responseText);
}