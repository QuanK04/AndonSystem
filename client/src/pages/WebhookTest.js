import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const TEAM_ID = '2f9ba389-5c1c-4903-8cde-d1e9d2e46802';
const CHANNEL_ID = '19:mWUxm9v5XYDN9M9S44wvCveg2kwZPKpQNg66T5ausIk1@thread.tacv2';
const FLOW_URL = 'https://prod-45.southeastasia.logic.azure.com:443/workflows/3d860fe555f04bc5a6a1a4630b9890c5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HWlj8bkWQBvhnaqVgDbwdsbTm5euiiynjAGKSveJenE';

const WebhookTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSend = async () => {
    setLoading(true);
    setResult('');
    try {
      await axios.post(FLOW_URL, {
        channelId: CHANNEL_ID,
        teamId: TEAM_ID,
        message: 'Đây là tin nhắn từ Andon'
      });
      setResult('Đã gửi thành công!');
    } catch (err) {
      setResult('Gửi thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, borderRadius: 3, boxShadow: 3, bgcolor: '#fff', textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Test gửi Webhook
      </Typography>
      <Button variant="contained" color="primary" onClick={handleSend} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Gửi tin nhắn Webhook'}
      </Button>
      {result && (
        <Typography variant="body2" color={result.includes('thành công') ? 'success.main' : 'error.main'} sx={{ mt: 2 }}>
          {result}
        </Typography>
      )}
    </Box>
  );
};

export default WebhookTest; 