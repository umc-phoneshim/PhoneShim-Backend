import * as groupService from '../application/groupService';
import asyncHandler from '../../../shared/utils/asyncHandler';

export const listGroups = asyncHandler(async (req, res) => {
  const result = await groupService.listGroups();

  res.json({
    success: true,
    data: result
  });
});

export const createGroup = asyncHandler(async (req, res) => {
  const result = await groupService.createGroup(req.body);

  res.status(201).json({
    success: true,
    data: result
  });
});
