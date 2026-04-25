import ActivityLog from '../models/ActivityLog.js';

export const getActivityLogs = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const logs = await ActivityLog.find({ rfqId }).sort({ createdAt: -1 });
    
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
