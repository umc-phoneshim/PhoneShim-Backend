import asyncHandler from '../../../shared/utils/asyncHandler';

import * as userService from '../application/userService';

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserByUserId(req.user?.userId!);

  res.json({
    success: true,
    data: user
  });
});
