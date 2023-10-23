import Fuse from 'fuse.js';
import { Connection, Workbook } from './types';
import * as fuzzball from 'fuzzball';

// prettier-ignore
const STOP_WORDS = [
    "a", "about", "above", "after", "again", "against", "ain", "all", "am", "an", "and", "any", "are", "aren", "aren't", "as", 
    "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "couldn", "couldn't", "d", 
    "did", "didn", "didn't", "do", "does", "doesn", "doesn't", "doing", "don", "don't", "down", "during", "each", "few", "for", 
    "from", "further", "had", "hadn", "hadn't", "has", "hasn", "hasn't", "have", "haven", "haven't", "having", "he", "her", 
    "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn", "isn't", "it", "it's", "its", 
    "itself", "just", "ll", "m", "ma", "me", "mightn", "mightn't", "more", "most", "mustn", "mustn't", "my", "myself", "needn", 
    "needn't", "no", "nor", "not", "now", "o", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", 
    "over", "own", "re", "s", "same", "shan", "shan't", "she", "she's", "should", "should've", "shouldn", "shouldn't", "so", "some", 
    "such", "t", "than", "that", "that'll", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", 
    "those", "through", "to", "too", "under", "until", "up", "ve", "very", "was", "wasn", "wasn't", "we", "were", "weren", 
    "weren't", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "won", "won't", "wouldn", 
    "wouldn't", "y", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
];

export const flattenWorkbooksWithSheets = (workbooks: Workbook[]) => {
  return workbooks?.flatMap((workbook) => {
    const workbookName = workbook.name;
    return workbook.spreadsheets.map((spreadsheet) => ({
      id: workbook._id,
      name: workbookName,
      sheet: spreadsheet,
    }));
  });
};

function preprocessChoices(choices) {
  return choices.map(function (choice) {
    const updated = choice.replace(/properties\./g, '');
    return { choice, updated };
  });
}

function queryToWords(query) {
  query = query.trim();
  query = query.replace(/[,!?]/g, '');
  return query.split(' ').filter(function (word) {
    return STOP_WORDS.indexOf(word) === -1;
  });
}

function findMatches(query, choices) {
  const updatedChoices = preprocessChoices(choices);
  const words = queryToWords(query);
  return words
    .map(function (word) {
      const chosen = fuzzball
        .extract(word, updatedChoices, {
          cutoff: 60,
          processor: function (choice) {
            return choice.updated;
          },
        })
        .map(function (item) {
          return item[0];
        });
      return { word, choices: chosen };
    })
    .filter(function (item) {
      return item.choices.length;
    });
}

export function computeTokenMap(text, properties) {
  const _tokens = findMatches(text, properties);
  const tokenMap = _tokens.reduce(function (a, b) {
    a[b.word] = b.choices.map(function (c) {
      return c.choice;
    });
    return a;
  }, {});
  return tokenMap;
}

export const getTableColumnMap = (connections: Connection[]) => {
  const tableColumnMap = {};
  connections.forEach((connection) => {
    connection.connection_data.forEach((data) => {
      data.connection_source.forEach((source) => {
        const tableName = source.table_name;
        const columns = source.fields;
        tableColumnMap[tableName] = columns;
      });
    });
  });
  return tableColumnMap;
};

export const getProperties = (connections: Connection[], tableName: string) => {
  const tableColumnMap = getTableColumnMap(connections);
  return tableColumnMap[tableName];
};

export const getDateFromTimestamp = (dateObj: Date) => {
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // Months are zero-based
  const year = dateObj.getFullYear();

  const formattedDate = `${day}/${(month < 10 ? '0' : '') + month}/${year}`;
  return formattedDate;
};

export const getFormattedTimeIn12HourFormat = (timestamp: Date): string => {
  const hours = timestamp.getHours();
  const minutes = timestamp.getMinutes();

  const amOrPm = hours >= 12 ? 'PM' : 'AM';

  const hours12 = hours % 12 || 12;

  const formattedTime = `${hours12}:${
    minutes < 10 ? '0' : ''
  }${minutes} ${amOrPm}`;
  return formattedTime;
};

export const getCurrentSheetActiveCell = (
  sheetName: string,
  columnIndex: number,
  rowIndex: number
) => {
  return `${sheetName}!${String.fromCharCode(65 + columnIndex - 1)}${rowIndex}`;
};

export const getSearchResult = <T>(
  data: T[],
  query: string,
  options: Fuse.IFuseOptions<any>
): T[] => {
  const fuse = new Fuse(data, options);
  return fuse.search(query).map((result) => result.item);
};
