# domain

Pure JavaScript Domain Class.

- Entityは一意なIDを持つ(復元、検索に必要)
- インフラがDomainモデルの作り方を知りたくないので、Factoryを持っている
- ドメインモデルとFactoryは1vs.1だが、簡単なやつ(newして終わり)みたいのはFactoryを持っている必要はない