// Create a public bucket
const response = await fetch('http://localhost:5000/api/v1/buckets', {
  method: 'POST',
  headers: {
    'X-API-Key': 'sk_live_I46JDPF2eRqw8ReNegblZGCANZBFnZri',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my-app-uploads',
    visibility: 'public', // or 'private'
    description: 'User uploads for my app'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Bucket created:', result.data.id);
  console.log('Bucket name:', result.data.name);
} else {
  console.error('Error:', result.message);
}