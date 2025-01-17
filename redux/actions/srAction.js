import {
  FETCHING_BIZS_REQUEST,
  FETCHING_BIZS_SUCCESS,
  FETCHING_BIZS_FAILURE,
  FETCHING_COMMENTS_REQUEST,
  FETCHING_COMMENTS_SUCCESS,
  FETCHING_COMMENTS_FAILURE,
  POSTING_COMMENT_REQUEST,
  POSTING_COMMENT_SUCCESS,
  POSTING_COMMENT_FAILURE,
  CHANGE_CAT,
  ANSWER_STATUS,
} from "./types";
import axios from "axios";

export const fetchingBizsRequest = () => ({ type: FETCHING_BIZS_REQUEST });

export const fetchingBizsSuccess = (json) => ({
  type: FETCHING_BIZS_SUCCESS,
  payload: json,
});

export const fetchingBizsFailure = (error) => ({
  type: FETCHING_BIZS_FAILURE,
  payload: error,
});

export const fetchingCommentsRequest = () => ({
  type: FETCHING_COMMENTS_REQUEST,
});

export const fetchingCommentsSuccess = (json) => ({
  type: FETCHING_COMMENTS_SUCCESS,
  payload: json,
});

export const fetchingCommentsFailure = (error) => ({
  type: FETCHING_COMMENTS_FAILURE,
  payload: error,
});

export const postingCommentRequest = () => ({ type: POSTING_COMMENT_REQUEST });

export const postingCommentSuccess = (json) => ({
  type: POSTING_COMMENT_SUCCESS,
  payload: json,
});

export const postingCommentFailure = (error) => ({
  type: POSTING_COMMENT_FAILURE,
  payload: error,
});

export const fetchBizs = () => {
  return async (dispatch) => {
    dispatch(fetchingBizsRequest());
    try {
      let response = await axios(`http://localhost:3000/user_bizs`);
      // let json = await response.json();
      dispatch(fetchingBizsSuccess(response.data));
    } catch (error) {
      dispatch(fetchingBizsFailure(error));
    }
  };
};

export const fetchComments = (id) => {
  return async (dispatch) => {
    dispatch(fetchingCommentsRequest());
    try {
      let response = await axios(`http://localhost:3000/businesses/${id}`);
      // let json = await response.json();
      dispatch(fetchingCommentsSuccess(response.data.comments));
    } catch (error) {
      dispatch(fetchingCommentsFailure(error));
    }
  };
};

export const postComment = (comment) => {
  return async (dispatch) => {
    dispatch(postingCommentRequest());
    try {
      let response = await axios.post(`http://localhost:3000/comments`, {
        comment,
      });
      // let json = await response.json();
      dispatch(postingCommentSuccess(response.data));
    } catch (error) {
      dispatch(postingCommentFailure(error));
    }
  };
};

export const changeCat = (cat) => ({
  type: CHANGE_CAT,
  payload: cat,
});

export const answerStatus = (status) => ({
  type: ANSWER_STATUS,
  payload: status,
});
