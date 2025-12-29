import express from 'express';
import cors from 'cors';
import { config } from './config';
import { telegramSendMessage } from "./telegram-send-message";

export interface IRequest {
  name: string;
  phone: string;
}

const app = express();

function removeAllSpaces(str: string): string {
  return str.replace(/\s/g, '');
}

const allowedOriginsURL = [
  'https://kunkhmerboxing.ru',
  process.env.CLIENT_URL
];

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = allowedOriginsURL.filter(Boolean);

    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed'));
    }
  },
  methods: ['POST'],
  credentials: true
}));

app.use(express.json());

// Роут для обработки номера телефона
app.post('/feedback', async (req: any, res: any) => {
  try {
    const { phone, name } = req.body as IRequest;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Отправляем email
    // await sendEmail(phone);
    await telegramSendMessage(
      removeAllSpaces(phone),
      process.env.TELEGRAM_TOKEN as string,
      process.env.TELEGRAM_CHAT_ID as string,
      name
    );

    return res.status(200).json({
      success: true,
      message: 'Request processed successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Запуск сервера
app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});