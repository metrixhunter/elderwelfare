import readUserFromLocalJson from '@/app/utils/readFromLocalJson';

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return Response.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    const user = readUserFromLocalJson(phone);

    if (user) {
      return Response.json({ success: true, user });
    } else {
      return Response.json({ success: false, message: 'User not found in local_users.json' }, { status: 404 });
    }
  } catch (e) {
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
