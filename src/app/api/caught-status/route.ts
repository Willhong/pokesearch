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
      range: 'LivingForm!I2:P', //I=도감번호, K=잡은 여부, L=폼 이름, P=성별
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    const caughtStatus: { [key: string]: boolean } = {};
    rows.forEach((row: any) => {
      if (row[0] === undefined) return;
      const pokemonId = row[0].replace(/^0+/, '');
      // console.log('row',row );
    //이미 번호가 있으면 다른 성별 처리는 caughtStatus의 키의 int 값을 parseInt로 변환하여 폼 row[0]에 -f를 붙임
    if (caughtStatus[pokemonId] !== undefined) {
      caughtStatus[pokemonId+'-f'] = row[2] === '1' || row[2] === '001';
      // console.log(row[0]+'-f', caughtStatus[row[0]+'-f']);
    }
    else{
      caughtStatus[pokemonId] = row[2] === '1' || row[2] === '001';
    }
    });

    return NextResponse.json(caughtStatus);
  } catch (error) {
    console.error('Error fetching caught status:', error);
    return NextResponse.json({ error: 'Failed to fetch caught status' }, { status: 500 });
  }
}