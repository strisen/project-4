exports.index = (req, res) => {
  res.send('/')
}

exports.fourZeroFour = (req, res) => {
  req.flash("404. What you're looking for is not found.")
  res.redirect('/')
}
