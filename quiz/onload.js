var _answers,_quiz

function encodeQuiz() {
   return btoa(JSON.stringify(_quiz))
}

function decodeQuiz(string) {
   _quiz = JSON.parse(atob(string))
}

function startQuiz(){
	_answers=[]
	putQuestion(0)
}

window.onload = function() {
	decodeQuiz(window.location.hash.substr(1))
   startQuiz()
}

function putQuestion(index) {
   document.forms.$quiz.$question.value = _quiz[index].question
   for (var i = 0; i < 4; i++) {
      document.forms.$quiz.$answer[i].nextSibling.textContent = _quiz[index].answer[i]
      document.forms.$quiz.$answer[i].checked = false
      document.forms.$quiz.$answer[i].onchange = function() {
         console.log(parseInt(this.value) == _quiz[index].correct)
         var correct = parseInt(this.value) == _quiz[index].correct
         alert(["wrong!", "correct!"][+correct])
         _answers.push(correct)
         if (++index < _quiz.length) {
            putQuestion(index)
         } else {
            document.forms.$quiz.$score.value = _answers.reduce(function(sum, a) {
               return sum + a
            }, 0) / index * 100 + "%";
         }
      }
   }
}
