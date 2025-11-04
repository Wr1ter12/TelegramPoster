function getPostsToPublish() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  const headers = data[1];
  const postsData = data.slice(2);
  
  const colIndex = {
    title: headers.indexOf('Title'),
    content: headers.indexOf('Content'),
    media: headers.indexOf('MediaContent'),
    hashtags: headers.indexOf('Hashtags'),
    datePub: headers.indexOf('DatePublication'),
    status: headers.indexOf('Status')
  };
  
  const today = new Date().toDateString();
  
  return postsData
    .map((row, index) => ({ 
      row, 
      rowIndex: index + 2,
      colIndex 
    }))
    .filter(({ row, colIndex }) => {
      const status = row[colIndex.status];
      const pubDate = new Date(row[colIndex.datePub]).toDateString();
      return status !== 'Опубликован' && pubDate === today;
    });
}

function updatePostStatus(rowIndex, status, error = '') {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[1];
  
  const statusCol = headers.indexOf('Status') + 1;
  const dateCol = headers.indexOf('DatePublished') + 1;
  const errorCol = headers.indexOf('ErrorMessage') + 1;
  
  if (status === 'Опубликован') {
    sheet.getRange(rowIndex + 1, statusCol).setValue('Опубликован');
    sheet.getRange(rowIndex + 1, dateCol).setValue(new Date());
    sheet.getRange(rowIndex + 1, errorCol).clearContent();
  } else {
    sheet.getRange(rowIndex + 1, statusCol).setValue('Ошибка');
    sheet.getRange(rowIndex + 1, errorCol).setValue(error);
  }
}