<?php

/**
 * Посылает запрос с сервера.
 * Пример на cUrl
 * curl -X POST -d method=POST -d action=https://site.com/api/test -d debug=true -d headers[]="Content-type: multipart/form-data" -d json=false ./ApiConnector.php
 */
class ApiConnector
{

    /**
     * Признак тестового запуска
     * @var bool
     */
    private bool $debug = false;
    /**
     * Метод запроса
     * @var
     */
    private $method;

    /**
     * Тело запроса
     * @var
     */
    private $body = false;
    /**
     * Url API на который отправляем запрос
     * @var string
     */
    private $requestUrl;

    /**
     * Признак отправки json. Если true,
     * то нужно отправить соответствующий заголовок.
     * Используется при POST запросах
     * @var bool
     */
    private $json = false;

     /*
     * @var
     */
    private $post;

    /**
     * Заголовки для запроса
     * @var array
     */
    private $headers = [];

    /**
     * Валидирует POST
     * @return void
     */
    private function validatePost()
    {

        if (empty($_POST)) {
            $this->log("POST is empty", $_POST);
            die;
        }

        $this->post = $_POST;
        $this->log("POST заполнен", $this->post);


        if (isset($this->post['requestUrl'])) {
            $this->requestUrl = $this->post['requestUrl'];
        }

        if (isset($this->post['method'])) {
            $this->method = $this->post['method'];
        }
        if (isset($this->post['body'])) {
            $this->body = $this->post['body'];
        }
        if (isset($this->post['headers'])) {
            $this->headers = $this->post['headers'];
        }

        if (isset($this->post['debug'])) {
            $this->debug = true;
        }
    }

    private function setHeaders()
    {
        $this->log("setHeaders");

        if (isset($this->post['headers'])) {
            $this->headers = array_merge($this->headers, $this->post['headers']);
        }
        $this->log("Будут отправлены заголовки:", $this->headers);
    }


    /**
     * Отправляет GET запрос
     * @return bool|string
     */
    private function sendGet()
    {
        $this->log("sendGet");
        $this->log("Отправляем запрос на " . $this->requestUrl);

        $ch = curl_init($this->requestUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Отправляет POST запрос
     * @return bool|string
     */
    private function sendPost()
    {
        $this->log("sendPost");
        $this->log("Отправляем запрос на " . $this->requestUrl);

        $ch = curl_init($this->requestUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        if ($this->body) {

            if($this->json){

                $sendBody = json_encode($this->body, JSON_UNESCAPED_UNICODE);
            }else{

                $sendBody = $this->body;
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $sendBody);
        }

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Отправляет PUT запрос
     * @return bool|string
     */
    private function sendPut()
    {
        $this->log("sendPut");
        $this->log("Отправляем запрос на " . $this->requestUrl);

        $ch = curl_init($this->requestUrl);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        //curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        if ($this->body) {

            if($this->json){

                $sendBody = json_encode($this->body, JSON_UNESCAPED_UNICODE);
            }else{

                $sendBody = $this->body;
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $sendBody);
        }

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Выводит сообщение для отладки
     * @param string $msg Текст
     * @param string|array|boolean $data Доп. данные
     * @param string $type Тип вывода p|v print_r|var_dump
     * @return void
     */
    private function log($msg, $data = false, $type = 'p')
    {

        if ($this->debug) {
            echo "$msg <br> \n";

            if ($data) {
                if ($type == 'p') {
                    print_r($data);
                } else {
                    var_dump($data);
                }
            }

            echo "<br> \n";
        }
    }

    /**
     * Собирает всё до кучи
     * @return void
     */
    public function init()
    {

        $this->log("init");
        $this->validatePost();
        $this->setHeaders();
        header("Access-Control-Allow-Origin: *");
        switch ($this->method) {
            case 'GET':
                echo $this->sendGet();
                break;
            case 'POST':
                echo $this->sendPost();
                break;
            case 'PUT':
                echo $this->sendPut();
                break;
            default:
                $this->log("Не верный параметр method");
                die;
        }
    }

}

$connector = new ApiConnector();
$connector->init();