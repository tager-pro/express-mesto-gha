const Card = require('../models/card');
const {
  ERROR_CODE_INCORRECT,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_FORBIDDEN,
  ERROR_CODE_DEFAULT,
} = require('../utils/errors');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка сервера' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_INCORRECT).send({ message: 'Переданы некорректные данные при создании карточки.' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка сервера' });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
        return;
      }
      if (card.owner.toString() !== req.user._id) {
        res.status(ERROR_CODE_FORBIDDEN).send({ message: 'Запрещено удалять карточки других пользователей.' });
        return;
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then(() => res.send(card));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_INCORRECT).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка сервера' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_INCORRECT).send({ message: 'Переданы некорректные данные для постановки лайка.' });
        return;
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка сервера' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_INCORRECT).send({ message: ' Переданы некорректные данные для снятия лайка.' });
        return;
      }

      res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка сервера' });
    });
};
