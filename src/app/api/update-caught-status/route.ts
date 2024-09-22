import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

async function getGoogleSheetsClient() {
  const credentialsPath = path.join(process.cwd(), 'pokemonapi-436416-2fc4a29c6e92.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function POST(request: Request) {
  try {
    const { pokemonId, isCaught, isFemale } = await request.json();
    const sheets = await getGoogleSheetsClient();
    console.log(pokemonId, isCaught, isFemale);
    // 기본 행 번호 계산
    const rowNumber = pokemonId + 1;

    //시트의 I열에서 포켓몬 번호를 찾음
    const responsePokemonID = await sheets.spreadsheets.values.get({
      spreadsheetId: '1-KQpHd7ZVy_g9I3IYUL9hLyP9HC-DDEKK-XXN2Fs8Gs',
      range: 'LivingForm!I2:I',
    });
    const rows = responsePokemonID.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }
    const pokemonIndex = rows.findIndex(row => parseInt(row[0]) === pokemonId)+2;
    let range = `LivingForm!K${pokemonIndex}`;
    let values = [[isCaught ? '1' : '']];

    // female인 경우 추가 처리
    if (isFemale) {
      range = `LivingForm!K${pokemonIndex+1}`;
      values = [[isCaught ? '1' : '']];
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: '1-KQpHd7ZVy_g9I3IYUL9hLyP9HC-DDEKK-XXN2Fs8Gs',
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating caught status:', error);
    return NextResponse.json({ error: 'Failed to update caught status' }, { status: 500 });
  }
}