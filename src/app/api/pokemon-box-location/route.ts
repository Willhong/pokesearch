import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

async function getGoogleSheetsClient() {
  const credentialsPath = path.join(process.cwd(), 'pokemonapi-436416-2fc4a29c6e92.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1-KQpHd7ZVy_g9I3IYUL9hLyP9HC-DDEKK-XXN2Fs8Gs',
      range: 'LivingForm!B2:I', // I=도감번호, B=Page, C=Box, D=No, E=Row, F=Slot
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }
    const boxLocations: { [key: string]: { page: string, box: string, no: string, row: string, slot: string } } = {};
    rows.forEach((rowData: any) => {
      const [page, box, no, rowNum, slot,_,__,id] = rowData;
      if (id && page && box && no && rowNum && slot) {
        boxLocations[parseInt(id)] = { page, box, no, row: rowNum, slot };
      }
    });
    // console.log(boxLocations);
    return NextResponse.json(boxLocations);
  } catch (error) {
    console.error('Error fetching box locations:', error);
    return NextResponse.json({ error: 'Failed to fetch box locations' }, { status: 500 });
  }
}