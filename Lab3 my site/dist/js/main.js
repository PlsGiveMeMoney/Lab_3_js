let createTable = (data, idTable) => {
  let table = document.getElementById(idTable);
  let tr = document.createElement('tr');
  for (key in data[0]) {
    let th = document.createElement('th');
    th.innerHTML = key;
    tr.append(th);
  }
  table.append(tr);

  data.forEach((item) => {
    let tr = document.createElement('tr');
    for (key in item) {
      let td = document.createElement('td');
      td.innerHTML = item[key];
      tr.append(td);
    }
    table.append(tr);
  });
};
let correspond = {
 "Продукт": "structure",
 "Тип": "category",
 "Каллорийность": ["kkalFrom", "kkalTo"],
 "Белки": ["proteinFrom", "proteinTo"],
 "Жиры": ["fatFrom", "fatTo"],
 "Углеводы": ["carbsFrom", "carbsTo"]
}
let dataFilter = (dataForm) => {
 
 let dictFilter = {};
 // перебираем все элементы формы с фильтрами
 
 for(let j = 0; j < dataForm.elements.length; j++) {
 // выделяем очередной элемент формы
 let item = dataForm.elements[j];
 
 // получаем значение элемента
 let valInput = item.value;
 // если поле типа text - приводим его значение к нижнему регистру
 if (item.type == "text") {
 valInput = valInput.toLowerCase();
 }
 
 // самостоятельно обработать значения числовых полей:
 // если в поле занесено значение - преобразовать valInput к числу;
 if (!isNaN(parseFloat(valInput)) && isFinite(valInput)) {
  valInput = parseFloat(valInput);
 } 
 // если поле пусто и его id включает From - занести в valInput бесконечность
 else if (item.id.includes("From")) {
  valInput = -Infinity;
 } 
 // если поле пусто и его id включает To - занести в valInput +бесконечность
 else if (item.id.includes("To")) {
  valInput = Infinity;
 }
 
 // формируем очередной элемент ассоциативного массива
 dictFilter[item.id] = valInput;
 } 
 return dictFilter;
}

// Функция для удаления всех строк таблицы
function clearTable(idTable) {
  let table = document.getElementById(idTable);
  while (table.rows.length) {
    table.deleteRow(0);
  }
}

// Функция фильтрации таблицы
let filterTable = (data, idTable, dataForm) => {
  // Получаем данные из полей формы
  let datafilter = dataFilter(dataForm);

  // Выбираем данные, соответствующие фильтру, и формируем таблицу из них
  let tableFilter = data.filter(item => {
    let result = true;

    // Строка соответствует фильтру, если сравнение всех значений из input
    // со значением ячейки очередной строки - истина
    for (let key in correspond) {
      let val = item[key];
      let filterValue = datafilter[correspond[key]];

      // Текстовые поля проверяем на вхождение
      if (typeof val === 'string') {
        val = val.toLowerCase();
        result = result && val.includes(filterValue);
      }
      // Числовые поля проверяем на принадлежность интервалу
      else if (typeof val === 'number') {
        let fromKey = correspond[key][0];
        let toKey = correspond[key][1];
        let fromVal = datafilter[fromKey];
        let toVal = datafilter[toKey];

        // Проверяем, попадает ли значение в заданный интервал
        result = result && val >= fromVal && val <= toVal;
      }
    }
    return result;
  });

  // Удаляем все строки таблицы, кроме заголовка
  clearTable(idTable);

  // Показываем на странице таблицу с отфильтрованными строками
  createTable(tableFilter, idTable);
}

// Функция для очистки фильтров и восстановления исходной таблицы
function clearFilter() {
  // Получаем форму по её id
  let form = document.getElementById('filter');
  
  // Очищаем все поля формы
  Array.from(form.elements).forEach(element => {
    if (element.type === 'text' || element.type === 'number') {
      element.value = '';
    }
  });
}

// формирование полей элемента списка с заданным текстом и значением
let createOption = (str, val) => {
 let item = document.createElement('option');
 item.text = str;
 item.value = val;
 return item;
}
// формирование полей со списком из заголовков таблицы
// параметры – массив из заголовков таблицы и элемент select
let setSortSelect = (head, sortSelect) => {
 
 // создаем OPTION и добавляем ее в SELECT
 sortSelect.append(createOption('Нет', 0));
 
 // перебираем все ключи переданного элемента массива данных
 for (let i in head) {
 // создаем OPTION из очередного ключа и добавляем в SELECT
 // значение атрибута VAL увеличиваем на 1, так как значение 0 имеет опция Нет
 sortSelect.append(createOption(head[i], Number(i) + 1));
 }
}
// формируем поля со списком для многоуровневой сортировки
let setSortSelects = (data, dataForm) => {
 // выделяем ключи словаря в массив
 let head = Object.keys(data);
 // находим все SELECT в форме
 let allSelect = dataForm.getElementsByTagName('select');
 
 for(let j = 0; j < allSelect.length; j++) {
 //формируем опции очередного SELECT
 setSortSelect(head, allSelect[j]);
  if (j > 0) {
      allSelect[j].disabled = true;
    }
 }
};

// настраиваем поле для следующего уровня сортировки
let changeNextSelect = (nextSelectId, curSelect, third) => {
 
 let nextSelect = document.getElementById(nextSelectId);
 let thirdSelect = document.getElementById(third);
 nextSelect.disabled = false;
 
 // в следующем SELECT выводим те же option, что и в текущем
 nextSelect.innerHTML = curSelect.innerHTML;
 
 // удаляем в следующем SELECT уже выбранную в текущем опцию
 // если это не первая опция - отсутствие сортировки
 if (curSelect.value != 0) {
 nextSelect.remove(curSelect.value);

 } else {
 nextSelect.disabled = true;
 thirdSelect.disabled = true;
 }
}

let createSortArr = (data) => {
 let sortArr = [];
 
 let sortSelects = data.getElementsByTagName('select');
 
 for (let i = 0; i < sortSelects.length; i++) {
 
 // получаем номер выбранной опции
 let keySort = sortSelects[i].value;
 // в случае, если выбрана опция Нет, заканчиваем формировать массив
 if (keySort == 0) {
 break;
 }
 // получаем номер значение флажка для порядка сортировки
 // имя флажка сформировано как имя поля SELECT и слова Desc
 let desc = document.getElementById(sortSelects[i].id + 'Desc').checked;
 sortArr.push({column: keySort - 1, order: desc});
 }
 return sortArr;
};

let sortTable = (idTable, data) => {
  // формируем управляющий массив для сортировки
  let sortArr = createSortArr(data);

  // сортировать таблицу не нужно, если во всех полях выбрана опция "Нет"
  if (sortArr.length === 0) {
    return false;
  }
  // находим нужную таблицу
  let table = document.getElementById(idTable);
  // преобразуем строки таблицы в массив
  let rowData = Array.from(table.rows);

  // удаляем элемент с заголовками таблицы
  rowData.shift();

  rowData.sort((first, second) => {
    for (let i = 0; i < sortArr.length; i++) {
      let key = sortArr[i].column;
      let order = sortArr[i].order;
      let firstValue = first.cells[key].innerHTML.toLowerCase();
      let secondValue = second.cells[key].innerHTML.toLowerCase();

      // Проверяем, являются ли сравниваемые значения числами
      let firstNumber = parseFloat(firstValue.replace(/,/g, ''));
      let secondNumber = parseFloat(secondValue.replace(/,/g, ''));
      if (!isNaN(firstNumber) && !isNaN(secondNumber)) {
        firstValue = firstNumber;
        secondValue = secondNumber;
      }

      // Сравниваем значения в зависимости от порядка сортировки
      if (firstValue < secondValue) {
        return order ? 1 : -1;
      } else if (firstValue > secondValue) {
        return order ? -1 : 1;
      }
      // Если значения равны, продолжаем сравнение со следующим уровнем сортировки
    }
    // Добавляем третий уровень сортировки (если он есть)
    if (sortArr.length > 2 && first.cells[sortArr[2].column].innerHTML !== second.cells[sortArr[2].column].innerHTML) {
      let thirdKey = sortArr[2].column;
      let thirdOrder = sortArr[2].order;
      let firstThirdValue = first.cells[thirdKey].innerHTML.toLowerCase();
      let secondThirdValue = second.cells[thirdKey].innerHTML.toLowerCase();

      let firstThirdNumber = parseFloat(firstThirdValue.replace(/,/g, ''));
      let secondThirdNumber = parseFloat(secondThirdValue.replace(/,/g, ''));
      if (!isNaN(firstThirdNumber) && !isNaN(secondThirdNumber)) {
        firstThirdValue = firstThirdNumber;
        secondThirdValue = secondThirdNumber;
      }

      if (firstThirdValue < secondThirdValue) {
        return thirdOrder ? 1 : -1;
      } else if (firstThirdValue > secondThirdValue) {
        return thirdOrder ? -1 : 1;
      }
    }
    return 0;
  });

  // выводим отсортированную таблицу на страницу
  table.innerHTML = table.rows[0].innerHTML;

  rowData.forEach(item => {
    table.append(item);
  });
};


document.addEventListener('DOMContentLoaded', () => {
  // Получаем кнопку сортировки по её идентификатору
  let sortButton = document.getElementById('sort-button');

  // Добавляем обработчик события 'click' для кнопки сортировки
  sortButton.addEventListener('click', () => {
    // Вызываем функцию sortTable с ID таблицы и элементом формы
    sortTable('list', document.getElementById('sort'));
  });
});

// Функция для сброса сортировки
function resetSort(idTable, dataForm) {
  // Сброс формы сортировки
  dataForm.reset();
  // Отключение всех SELECT, кроме первого
  let allSelects = dataForm.getElementsByTagName('select');
  for (let i = 1; i < allSelects.length; i++) {
    allSelects[i].disabled = true;
  }
  // Сброс чекбоксов
  let allCheckboxes = dataForm.getElementsByTagName('input');
  for (let i = 0; i < allCheckboxes.length; i++) {
    if (allCheckboxes[i].type === 'checkbox') {
      allCheckboxes[i].checked = false;
    }
  }

  // Восстановление исходной таблицы
  clearTable(idTable);
  createTable(products, idTable); 
}

// Добавление обработчика события клика на кнопку "Сбросить сортировку"
document.addEventListener('DOMContentLoaded', () => {
  let resetButton = document.getElementById('sort-button-clear');
  resetButton.addEventListener('click', () => {
    resetSort('list', document.getElementById('sort'));
  });
});


document.addEventListener('DOMContentLoaded', () => {

  setSortSelects(products[0], document.getElementById('sort'));
});

//связывание функции clearFilter с кнопкой "Очистить фильтры"
document.getElementById('clear-button').addEventListener('click', function() {
  clearFilter(); 
  clearTable('list');
  createTable(products, 'list');
});

document.addEventListener('DOMContentLoaded', () => {

  let firstSelect = document.getElementById('fieldsFirst'); 

  firstSelect.addEventListener('change', () => {
    changeNextSelect('fieldsSecond', firstSelect,'fieldsThird'); 
  });
  
  let secondSelect = document.getElementById('fieldsSecond');
  secondSelect.addEventListener('change', () => {
    changeNextSelect('fieldsThird', secondSelect); 
  });
});


// получаем кнопку Найти
document.addEventListener('DOMContentLoaded', function() {
  // Получаем кнопку по её id
  let searchButton = document.getElementById('search-button');

  // Добавляем обработчик события клика
  searchButton.addEventListener('click', function() {
    // Получаем форму по её id
    let form = document.getElementById('filter');
 
    filterTable(products, 'list', form);
  });
});

document.addEventListener("DOMContentLoaded", function() {
 createTable(products, 'list');
})
