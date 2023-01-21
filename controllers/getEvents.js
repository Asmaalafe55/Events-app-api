import data from '../data/data.json' assert { type: 'json' };

export default (req, res) => {
  res.send(data);
};
