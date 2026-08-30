import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { token, title, body, targetPath } = await req.json();

    if (!token || !title) {
      return new Response(JSON.stringify({ error: "Missing token or title" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await admin.messaging().send({
      token,
      notification: { title, body: body ?? "" },
      webpush: {
        fcmOptions: {
          link: targetPath ?? "/",
        },
        notification: {
          icon: "/icons/icon-192.png",
        },
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ส่ง push ไม่สำเร็จ:", err);
    return new Response(JSON.stringify({ error: "Failed to send push" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/send-push",
};