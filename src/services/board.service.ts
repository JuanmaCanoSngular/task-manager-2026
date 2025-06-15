import axios from 'axios';
import { Board } from '../interfaces/board.interface';
const BASE_URL =
  'https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager';
export const boardService = {
  async getBoardList(): Promise<Board[]> {
    return axios.get<Board[]>(`${BASE_URL}/list.json`).then((response) => response.data);
  },

  async getBoardDetails(url: string): Promise<Board> {
    return axios.get<Board>(url).then((response) => response.data);
  },
};
