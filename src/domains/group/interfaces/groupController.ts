import * as groupService from '../application/groupService';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

export const listGroups = asyncHandler(async (req, res) => {
  const result = await groupService.listGroups();

  sendSuccess(res, result);
});

export const createGroup = asyncHandler(async (req, res) => {
  const result = await groupService.createGroup(req.body);

  sendCreated(res, result);
});
