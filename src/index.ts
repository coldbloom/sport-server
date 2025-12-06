import express from 'express';
import cors from 'cors';
// import rateLimit from 'express-rate-limit';
import { config } from './config';
import { telegramSendMessage } from "./telegram-send-message";
// import { sendEmail } from './mailer';

export interface IRequest {
  name: string;
  phone: string;
}

const app = express();

function removeAllSpaces(str: string): string {
  return str.replace(/\s/g, '');
}

const allowedOriginsURL = [
  'https://holodniypartner.ru',
  'https://conditioners-plum.vercel.app',
  process.env.CLIENT_URL
];

// Разрешает все домены и методы
app.use(cors({
  origin: true,  // Автоматически разрешает текущий origin
  methods: ['POST'],
  credentials: true
}));

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

// Rate limiting
// const feedbackLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 минут
//   max: 5, // 5 запросов с IP
//   message: { error: 'Слишком много запросов' }
// });

app.use(express.json());
// app.use('/feedback', feedbackLimiter);

// Роут для обработки номера телефона
app.post('/feedback', async (req: any, res: any) => {
  try {
    const { phone, name } = req.body as IRequest;
    const origin = req.headers.origin;

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

    // if (origin === process.env.FREEZE_MASTER) {
    //
    // }
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