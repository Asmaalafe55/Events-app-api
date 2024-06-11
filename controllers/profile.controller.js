import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';

// In your backend controller
export const updateUserProfile = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, description, avatar } = req.body;
  
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing user ID');
    }
  
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { firstName, lastName, description, avatar },
      { new: true }
    );
  
    if (!updatedUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
  
    res.status(httpStatus.OK).send(updatedUser);
  });
  